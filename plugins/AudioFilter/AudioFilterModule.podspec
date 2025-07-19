Pod::Spec.new do |s|
  s.name         = 'AudioFilterModule'
  s.version      = '1.0.0'
  s.summary      = 'Native audio filter + playback module'
  s.homepage     = 'https://your.repo/or/homepage'
  s.license      = { :type => 'MIT' }
  s.author       = { 'Tai Nguyen' => 'tainguyen7696@gmail.com' }
  s.platform     = :ios, '11.0'
  s.source       = { :path => '.' }
  s.source_files = 'AudioFilterModule.{swift,m}'
  s.swift_version = '5.0'
  s.requires_arc = true
end
