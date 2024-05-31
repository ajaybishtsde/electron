{
    "targets": [{
        "target_name": "desktop_session_status",
        "sources": [ "src/main.cc" ],
        "include_dirs": ["<!(node -e \"require('nan')\")"],
        "conditions": [
            ['OS=="mac"', {                
                "sources": ["src/desktop_sesison_status_darwin.cc"],
                "xcode_settings": {
                    "OTHER_CPLUSPLUSFLAGS": ["-std=c++11", "-stdlib=libc++", "-mmacosx-version-min=10.7"],
                    "OTHER_LDFLAGS": ["-framework CoreFoundation -framework CoreGraphics"]
                }
            }],
            ['OS=="win"', {            
                "sources": ["src/desktop_session_status_win32.cc"]                
            }],
            ['OS=="linux"', {            
                "sources": ["src/desktop_session_status_linux.cc"]                
            }]
        ]
    }]
}