require "json"

# Installs an automatic `pod install`-time workaround for an Xcode archive
# bug that collides on OkHi's SPM-vendored xcframework signature file. See
# ios/okhi_spm_signature_fix.rb for details. Loaded eagerly (not just inside
# the `if defined?(spm_dependency)` branch below) so it's also active when
# this podspec is linted or otherwise evaluated outside of `pod install`.
require_relative "ios/okhi_spm_signature_fix"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeOkHi"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/OkHi/react-native-okhi.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"

  if defined?(spm_dependency)
    spm_dependency(s,
      url: 'https://github.com/OkHi/ios-okhi',
      requirement: { kind: 'exactVersion', version: '1.10.19' },
      products: ['OkHi']
    )
  else
    s.dependency "OkHi", "1.10.19"
  end
  install_modules_dependencies(s)
end
