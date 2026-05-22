$folders = @(
    "tours/alberta-hub/",
    "tours/british-columbia-hub/",
    "tours/manitoba-hub/",
    "tours/new-brunswick-hub/",
    "tours/newfoundland-labrador-hub/",
    "tours/nova-scotia-hub/",
    "tours/nunavut-hub/",
    "tours/ontario-hub/",
    "tours/pei-hub/",
    "tours/quebec-hub/",
    "tours/saskatchewan-hub/",
    "tours/yukon-hub/",
    "tours/montreal-hub/"
)

foreach ($folder in $folders) {
    1..50 | ForEach-Object {
        $num = '{0:D3}' -f $_
        Copy-Item "tours/product-template.html" "$folder/tour-$num.html"
    }
}
