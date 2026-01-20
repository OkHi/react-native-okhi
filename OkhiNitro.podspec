require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "OkhiNitro"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  # NitroModules with C++20 Swift-C++ interop requires iOS 16.0+ for CxxStdlib
  s.platforms    = { :ios => '16.0', :visionos => 1.0 }
  s.source       = { :git => "https://github.com/OkHi/react-native-okhi.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  load 'nitrogen/generated/ios/OkhiNitro+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency "OkHi", "~> 1.10.5"
  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
