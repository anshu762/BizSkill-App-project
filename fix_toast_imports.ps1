$root = "c:\Users\Anubhav Singh\Desktop\BS2"

# Handle bracket files with literal paths
$bracketFiles = @(
  @{ 
    path = 'c:\Users\Anubhav Singh\Desktop\BS2\apps\mobile\app\team\[teamId].tsx'
    new_import = 'import Toast from "../../src/lib/toast"'
  }
  @{ 
    path = 'c:\Users\Anubhav Singh\Desktop\BS2\apps\mobile\app\profile\[userId].tsx'
    new_import = 'import Toast from "../../src/lib/toast"'
  }
  @{ 
    path = 'c:\Users\Anubhav Singh\Desktop\BS2\apps\mobile\app\post\[postId].tsx'
    new_import = 'import Toast from "../../src/lib/toast"'
  }
)

$old = 'import Toast from "react-native-toast-message"'

foreach ($r in $bracketFiles) {
  if (Test-Path -LiteralPath $r.path) {
    $content = [System.IO.File]::ReadAllText($r.path, [System.Text.Encoding]::UTF8)
    $updated = $content.Replace($old, $r.new_import)
    [System.IO.File]::WriteAllText($r.path, $updated, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $($r.path)"
  } else {
    Write-Host "NOT FOUND: $($r.path)"
  }
}

Write-Host "Done!"
