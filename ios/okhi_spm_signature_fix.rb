# frozen_string_literal: true

# Works around a long-standing Xcode bug, reproducible from Xcode 16 through at least Xcode 27

OKHI_SPM_SIGNATURE_FIX_FRAMEWORK_NAMES = ['OkHi'].freeze
OKHI_SPM_SIGNATURE_FIX_SLICES = ['ios', 'ios-simulator', 'ios-maccatalyst'].freeze
OKHI_SPM_SIGNATURE_FIX_PHASE_NAME = '[OkHi] Remove duplicate SPM xcframework signature files'
OKHI_SPM_SIGNATURE_FIX_EMBED_PHASE_NAME = '[CP] Embed Pods Frameworks'

def okhi_spm_signature_fix_shell_script
  lines = OKHI_SPM_SIGNATURE_FIX_FRAMEWORK_NAMES.flat_map do |name|
    OKHI_SPM_SIGNATURE_FIX_SLICES.map do |slice|
      %(rm -f "${CONFIGURATION_BUILD_DIR}/#{name}.xcframework-#{slice}.signature")
    end
  end
  "#{lines.join("\n")}\n"
end

def okhi_spm_signature_fix_manual_instructions
  lines = OKHI_SPM_SIGNATURE_FIX_FRAMEWORK_NAMES.flat_map do |name|
    OKHI_SPM_SIGNATURE_FIX_SLICES.map do |slice|
      %(  rm -f "${CONFIGURATION_BUILD_DIR}/#{name}.xcframework-#{slice}.signature")
    end
  end
  lines.join("\n")
end

def okhi_fix_spm_archive_signature_collision(installer)
  shell_script = okhi_spm_signature_fix_shell_script
  touched_projects = []

  installer.aggregate_targets.each do |aggregate_target|
    aggregate_target.user_targets.each do |native_target|
      build_phases = native_target.build_phases

      existing = build_phases.find do |phase|
        phase.respond_to?(:name) && phase.name == OKHI_SPM_SIGNATURE_FIX_PHASE_NAME
      end

      if existing
        build_phases.delete(existing)
        phase = existing
      else
        phase = native_target.project.new(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
        phase.name = OKHI_SPM_SIGNATURE_FIX_PHASE_NAME
        phase.shell_path = '/bin/sh'
      end
      phase.shell_script = shell_script

      embed_index = build_phases.find_index do |build_phase|
        build_phase.respond_to?(:name) && build_phase.name == OKHI_SPM_SIGNATURE_FIX_EMBED_PHASE_NAME
      end
      if embed_index
        build_phases.insert(embed_index, phase)
      else
        build_phases << phase
      end

      touched_projects << native_target.project
    end
  end

  touched_projects.uniq(&:path).each(&:save)
rescue StandardError => e
  Pod::UI.warn "[OkHi] Couldn't automatically install the SPM archive signature-collision workaround " \
    "(#{e.message}). If `xcodebuild archive` fails with \"couldn't be copied to Signatures\", add a Run " \
    "Script build phase to your app target, right before \"#{OKHI_SPM_SIGNATURE_FIX_EMBED_PHASE_NAME}\", " \
    "that runs:\n#{okhi_spm_signature_fix_manual_instructions}"
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
