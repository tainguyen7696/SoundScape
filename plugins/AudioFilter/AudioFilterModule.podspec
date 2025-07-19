Pod::Spec.new do |s|
  s.name             = 'AudioFilterModule'
  s.version          = '1.0.0'
  s.summary          = 'Native audio filter + playback module (ObjC)'
  s.homepage         = 'https://your.repo/or/homepage'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Tai' => 'tainguyen7696@gmail.com' }
  s.platform         = :ios, '11.0'
  s.source           = { :path => '.' }
  s.source_files     = 'AudioFilterModule.{h,m}'
  s.requires_arc     = true

  # React headers, so RCTBridgeModule is found
  s.dependency 'React-Core'
  s.dependency 'React-RCTBridge'
end
