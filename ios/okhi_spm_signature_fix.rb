# frozen_string_literal: true

# Works around two related problems caused by consuming OkHi.xcframework via
# `spm_dependency` (cocoapods-spm) instead of `vendored_frameworks`:

OKHI_SPM_FIX_FRAMEWORK_NAMES = ['OkHi'].freeze
OKHI_SPM_SIGNATURE_FIX_SLICES = ['ios', 'ios-simulator', 'ios-maccatalyst'].freeze
OKHI_SPM_SIGNATURE_FIX_PHASE_NAME = '[OkHi] Remove duplicate SPM xcframework signature files'
OKHI_SPM_EMBED_FIX_PHASE_NAME = '[OkHi] Embed OkHi.framework'
OKHI_SPM_CP_EMBED_PHASE_NAME = '[CP] Embed Pods Frameworks'

def okhi_spm_signature_fix_shell_script
  lines = OKHI_SPM_FIX_FRAMEWORK_NAMES.flat_map do |name|
    OKHI_SPM_SIGNATURE_FIX_SLICES.map do |slice|
      %(rm -f "${CONFIGURATION_BUILD_DIR}/#{name}.xcframework-#{slice}.signature")
    end
  end
  # `set -e` so a failing removal (e.g. permission denied -- `-f` only
  # suppresses "no such file" errors, not others) stops the script instead of
  # being masked by a later line succeeding and the phase reporting success.
  "set -e\n#{lines.join("\n")}\n"
end

def okhi_spm_signature_fix_manual_instructions
  lines = OKHI_SPM_FIX_FRAMEWORK_NAMES.flat_map do |name|
    OKHI_SPM_SIGNATURE_FIX_SLICES.map do |slice|
      %(  rm -f "${CONFIGURATION_BUILD_DIR}/#{name}.xcframework-#{slice}.signature")
    end
  end
  lines.join("\n")
end

# Mirrors what CocoaPods' own "[CP] Embed Pods Frameworks" phase does for
# frameworks it manages directly: copy the built framework into the app
# bundle's Frameworks folder and (re-)codesign it there.
def okhi_spm_embed_fix_shell_script
  blocks = OKHI_SPM_FIX_FRAMEWORK_NAMES.map do |name|
    <<~SH
      mkdir -p "${CODESIGNING_FOLDER_PATH}/Frameworks"
      rsync -a --delete "${BUILT_PRODUCTS_DIR}/#{name}.framework/" "${CODESIGNING_FOLDER_PATH}/Frameworks/#{name}.framework/"
      # The SPM-resolved framework is read-only on disk (Xcode marks
      # SourcePackages/checkouts artifacts non-writable) and `rsync -a`
      # preserves that, so `codesign` below would otherwise fail with
      # "Permission denied" trying to rewrite the signature in place.
      chmod -R u+w "${CODESIGNING_FOLDER_PATH}/Frameworks/#{name}.framework"
      if [ "${CODE_SIGNING_ALLOWED}" != "NO" ]; then
        codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY:--}" --preserve-metadata=identifier,entitlements,flags "${CODESIGNING_FOLDER_PATH}/Frameworks/#{name}.framework"
      fi
    SH
  end
  "set -e\n#{blocks.join}"
end

def okhi_spm_embed_fix_manual_instructions
  blocks = OKHI_SPM_FIX_FRAMEWORK_NAMES.map do |name|
    <<~SH
        mkdir -p "${CODESIGNING_FOLDER_PATH}/Frameworks"
        rsync -a --delete "${BUILT_PRODUCTS_DIR}/#{name}.framework/" "${CODESIGNING_FOLDER_PATH}/Frameworks/#{name}.framework/"
        chmod -R u+w "${CODESIGNING_FOLDER_PATH}/Frameworks/#{name}.framework"
        if [ "${CODE_SIGNING_ALLOWED}" != "NO" ]; then
          codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY:--}" --preserve-metadata=identifier,entitlements,flags "${CODESIGNING_FOLDER_PATH}/Frameworks/#{name}.framework"
        fi
    SH
  end
  blocks.join
end

# Finds the named shell script phase in `build_phases` (creating it if
# missing) and sets its script. Returns the phase; does not place it in
# `build_phases` yet, since callers need a freshly-computed insertion index.
def okhi_upsert_shell_script_phase(native_target, build_phases, name, shell_script)
  existing = build_phases.find do |phase|
    phase.respond_to?(:name) && phase.name == name
  end

  if existing
    build_phases.delete(existing)
    phase = existing
  else
    phase = native_target.project.new(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
    phase.name = name
    phase.shell_path = '/bin/sh'
  end
  phase.shell_script = shell_script
  phase
end

def okhi_fix_spm_archive_signature_collision(installer)
  signature_fix_script = okhi_spm_signature_fix_shell_script
  embed_fix_script = okhi_spm_embed_fix_shell_script
  touched_projects = []

  installer.aggregate_targets.each do |aggregate_target|
    aggregate_target.user_targets.each do |native_target|
      build_phases = native_target.build_phases

      # Deleting the stale SPM xcframework signature sentinel right before
      # CocoaPods' embed phase runs means re-resolving it later in this
      # build won't collide with another target's earlier resolution when
      # `xcodebuild archive` consolidates them into the .xcarchive's
      # Signatures/ folder.
      signature_phase = okhi_upsert_shell_script_phase(
        native_target, build_phases, OKHI_SPM_SIGNATURE_FIX_PHASE_NAME, signature_fix_script
      )
      cp_embed_index = build_phases.find_index do |build_phase|
        build_phase.respond_to?(:name) && build_phase.name == OKHI_SPM_CP_EMBED_PHASE_NAME
      end
      if cp_embed_index
        build_phases.insert(cp_embed_index, signature_phase)
      else
        build_phases << signature_phase
      end

      # Embed OkHi.framework into the app bundle ourselves, right after
      # CocoaPods' own embed phase has created the Frameworks folder --
      # nothing else in the build does this (see header comment).
      embed_fix_phase = okhi_upsert_shell_script_phase(
        native_target, build_phases, OKHI_SPM_EMBED_FIX_PHASE_NAME, embed_fix_script
      )
      cp_embed_index = build_phases.find_index do |build_phase|
        build_phase.respond_to?(:name) && build_phase.name == OKHI_SPM_CP_EMBED_PHASE_NAME
      end
      if cp_embed_index
        build_phases.insert(cp_embed_index + 1, embed_fix_phase)
      else
        build_phases << embed_fix_phase
      end

      touched_projects << native_target.project
    end
  end

  touched_projects.uniq(&:path).each(&:save)
rescue StandardError => e
  Pod::UI.warn "[OkHi] Couldn't automatically install the SPM archive signature-collision/embed workaround " \
    "(#{e.message}). If `xcodebuild archive` fails with \"couldn't be copied to Signatures\", add a Run " \
    "Script build phase to your app target, right before \"#{OKHI_SPM_CP_EMBED_PHASE_NAME}\", that runs:\n" \
    "#{okhi_spm_signature_fix_manual_instructions}\n" \
    "If your app crashes at launch with \"Library not loaded: @rpath/OkHi.framework/OkHi\", add another Run " \
    "Script build phase, right after \"#{OKHI_SPM_CP_EMBED_PHASE_NAME}\", that runs:\n" \
    "#{okhi_spm_embed_fix_manual_instructions}"
end

# `run_podfile_post_integrate_hooks` is a private instance method, so it
# must be checked with `private_method_defined?` -- `method_defined?` alone
# only sees public/protected methods and silently returns false for it.
okhi_hook_already_defined = Pod::Installer.private_method_defined?(:run_podfile_post_integrate_hooks_without_okhi_spm_signature_fix)
okhi_hook_definable = Pod::Installer.method_defined?(:run_podfile_post_integrate_hooks) ||
                       Pod::Installer.private_method_defined?(:run_podfile_post_integrate_hooks)

if okhi_hook_definable && !okhi_hook_already_defined
  Pod::Installer.send(:alias_method,
                       :run_podfile_post_integrate_hooks_without_okhi_spm_signature_fix,
                       :run_podfile_post_integrate_hooks)

  Pod::Installer.send(:define_method, :run_podfile_post_integrate_hooks) do
    run_podfile_post_integrate_hooks_without_okhi_spm_signature_fix
    okhi_fix_spm_archive_signature_collision(self)
  end
  Pod::Installer.send(:private, :run_podfile_post_integrate_hooks)
end
