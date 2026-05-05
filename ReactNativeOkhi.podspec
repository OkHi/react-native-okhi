require "json"

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

  spm_dependency(s,
    url: 'https://github.com/OkHi/ios-okhi',
    requirement: { kind: 'exactVersion', version: '1.10.15' },
    products: ['OkHi']
  )
  install_modules_dependencies(s)
end
