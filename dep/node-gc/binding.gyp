{
  "targets": [
    {
      "target_name": "gc",
      "sources": [ "src/gc.cc" ],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
