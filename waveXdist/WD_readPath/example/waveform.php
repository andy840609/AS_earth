<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>waveXdist</title>
    <!-- <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        crossorigin="anonymous"> -->
    <link rel="stylesheet" href="../src/bootstrap-4.5.3-dist/css/bootstrap.min.css">
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css"> -->
    <link rel="stylesheet" href="../src/bootstrap-slider-master/dist/css/bootstrap-slider.css">
    <!-- <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/11.0.2/css/bootstrap-slider.min.css"> -->

    <link href="../src/waveXdist.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css" integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ==" crossorigin="" />
    <link rel="stylesheet" href="https://cdn.datatables.net/1.12.1/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.3.0/css/responsive.bootstrap.min.css">
    <!-- <link rel="stylesheet" href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css"> -->
    
</head>

<body>
    <main class='container'></main>

    <!-- <script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
    <script src="https://d3js.org/d3.v6.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js"
        crossorigin="anonymous"></script> -->

    <script src="../src/jquery/jquery-3.5.1.min.js"></script>
    <script src="../src/d3/d3.min.js"></script>
    <script src="../src/bootstrap-4.5.3-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../src/bootstrap-slider-master/dist/bootstrap-slider.js"></script>
    <script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js" integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ==" crossorigin=""></script>
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/11.0.2/bootstrap-slider.min.js"></script> -->
    <script src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.12.1/js/dataTables.bootstrap5.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.datatables.net/responsive/2.3.0/js/dataTables.responsive.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.3.0/js/responsive.bootstrap.min.js"></script>

    <script src="../src/waveXdist.js"></script>
    <script>

        let catalog=window.location.search.substr(1).replace('catalog=','');
        // console.debug(catalog);
        let chart = waveXdist()
            // .dataPath({ data: paths, az: az, dist: dist, Taxis: Taxis })
            // .string({
            //     referenceTime: '2022-03-16 14:36',
            //     // title: 'AAA',
            // })
            .selector('.container');
        chart(catalog);

        

    </script>

</body>


</html>