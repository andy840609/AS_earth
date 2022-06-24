<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="seismic">
  <meta name="author" content="ies, tecdc">
  <title>TECDC</title>
  <!-- Bootstrap core CSS -->
  <!-- CSS only -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
  <!-- CSS only -->
  <!--link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous" -->
  <style>
    .bd-placeholder-img {
      font-size: 1.125rem;
      text-anchor: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }

    @media (min-width: 768px) {
      .bd-placeholder-img-lg {
        font-size: 3.5rem;
      }
    }
  </style>
  <!-- Custom styles for this template -->
  <link href="https://fonts.googleapis.com/css?family=Playfair&#43;Display:700,900&amp;display=swap" rel="stylesheet">
  <!-- Custom styles for this template -->
  <link href="./css/main.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
  <!-- 載入leaflet 的資料 -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin="" />
  <link rel="stylesheet" href="https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.css" />
  <!-- seis.php 專用-->
  <link href="./css/seis.css" rel="stylesheet">

  <!-- <link rel="import" href="../example/waveXdist.html" id="page1" /> -->

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-W7WZPM9XXR"></script>
  <script>
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-W7WZPM9XXR');
  </script>

</head>

<body>

  <meta name='author' content="Josh ,Chung-Hung Lo">
  <div id="main" class="container">
    <header class="container">
      <div class="row">
        <h2 class="col-lg-2 col-sm-12 d-flex align-items-center"> NOTICE </h2>
        <p class="col-lg-7 col-sm-12">This page ONLY provides the seismicity map.
          <br>
          If you need the detailed event list, please visit the
          <a href="https://gdmsn.cwb.gov.tw/index.php" target='_blank'>CWB_GDMS</a>.
        </p>
      </div>

    </header>

    <!-- map and chosen -->
    <div id="workspace" class="container ">
      <div id="position" class="row">
        <!-- left map -->
        <div id="Map" class="col-lg-6 col-sm-12"></div>
        <div id="legPos">
          <div id="depscale"></div>
          <div id="MLscale"></div>
        </div>

        <!-- legend -->

        <!-- right chosen -->

        <form id="filter" class="col-lg-6 col-sm-12">
          <!-- catalog-->
          <div class="panel">
            <div class="panel-label panel-label-corner">Catalog</div>
            <div class="d-flex justify-content row ">
              <select id="catalog" name="catalog" class="form-control  col-11">
                <option>Recent 90 days</option>
                <option>Archived</option>
              </select>

              <!-- help icon -->
              <div id="helpIcon" class="col-1">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <div class="hover col-sm-12"><b>Recent 90 days</b> : CWB Rapid Reports
                  <br>
                  <b>Archived</b> : revised by CWB. (1991-01-01~)
                </div>
              </div>


            </div>
          </div>
          <!-- date-->
          <div class="panel" id="date_panel" style="background-color: rgb(200, 200, 200)">
            <div id="dateUTC" class="panel-label panel-label-corner">Date (UTC+8) </div>
            <div class="text-end">
              <input id="datefrom" type="date" name="date" class="form-control col-lg-5 col-md-3" min="1991-01-01" max="9999-12-31" disabled="disabled">-
              <input id="dateto" type="date" name="date" class="form-control col-lg-5 col-md-3" max="9999-12-31" disabled="disabled">
            </div>
          </div>
          <!-- depth -->
          <div class="panel">
            <div class="panel-label panel-label-corner">Depth (km)</div>
            <div class="panel-tight text-end">
              <input type="text" class="form-control number" id="depthMin" name="depth" min="0" value="0">-
              <input type="text" class="form-control number" id="depthMax" name="depth" max="6371" value="1000">
            </div>
          </div>

          <!--Magnitude -->
          <div class="panel">
            <div class="panel-label panel-label-corner">ML</div>
            <div class="panel-tight text-end">
              <input type="text" class="form-control number" id="magMin" name="mag" value="3">-
              <input type="text" class="form-control number" id="magMax" name="mag" value="10" max="10">
            </div>
          </div>
          <!-- location -->
          <div class="panel">
            <div class="panel-label panel-label-corner">Location</div>
            <div class="panel-tight text-center">
              <table class="nsew-table">
                <tbody>
                  <tr>
                    <td>
                      <label for="lonMin">W</label>
                      <input type="text" size="8" class="form-control number" id="lonMin" name="lonMin" value="120">
                    </td>
                    <td>
                      <label for="latMax">N</label><br><input type="text" size="8" class="form-control number" id="latMax" name="latMax" value="26">
                      <br>
                      <input type="text" size="8" class="form-control number" id="latMin" name="latMin" value="21">
                      <br>
                      <label for="latMin">S</label>
                    </td>
                    <td>
                      <input type="text" size="8" class="form-control number" id="lonMax" name="lonMax" value="126">
                      <label for="lonMax">E</label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- legend  function-->
          <div class="panel">
            <div class="panel-label panel-label-corner"> Functions</div>
            <div class="panel-tight d-flex align-items-end flex-column row">
              <div class="offset-lg-5  offset-md-6  offset-sm-4">
                <div class="text-start p-1">
                  <input type="checkbox" id="Depth_legend" onclick="openLegend(0)" checked="">
                  <b>Depth Legend</b>
                </div>
                <div class=" text-start p-1">
                  <input type="checkbox" id="ML_legend" onclick="openLegend(1)" checked="">
                  <b>ML Legend</b>
                </div>
                <div class=" text-start p-1">
                  <input type="checkbox" id="grid" onclick="toggleGrid()">
                  <b>Grid Line</b>
                </div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-label panel-label-corner"> Size</div>
            <div class="panel-tight text-end row">
              <div class="col-md-12  ">
                <label for="circle_size "><b>Circle Size</b></label>
                <input type="text" class="form-control number " id="circle_size" value="5">
              </div>
            </div>
          </div>
          <!-- submit bottom-->
          <div class="container">
            <input id="submit" type="button" value="submit" class="btn btn-success" onclick="get_events()">
          </div>
        </form>
      </div>
    </div>
  </div>


  <!-- <div id="output_area" class="container">
    <h4 class="col-12">Criteria</h4>
    <p>Event catalog is provided by <a href="https://www.cwb.gov.tw/eng/" target='_blank'>Central Weather Bureau, Taiwan</a></p>
    <p id="output"></p>
  </div>
  </div> -->

  <div id="load">
    <div class="d-flex justify-content-center row">
      <div class="  spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden"></span>
      </div>
      <br>
      <span class="align-middle text-center">Loading...</span>
    </div>
  </div>


  <iframe id="iframe" name="framename" src="../example/waveXdist.html" frameborder="0" scrolling="yes" width="100%" style="width: 100vw; height: 100vh;"></iframe>


</body>
<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
<!-- JavaScript Bundle with Popper -->
<!--script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script-->

<script src="https://code.jquery.com/ui/1.13.0/jquery-ui.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<!-- JavaScript Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js" integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" crossorigin="anonymous"></script>

<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<!-- leaflet js -->
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.min.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>

<!--map-->
<script type="text/javascript" src="./js/seis/checkinput.js"></script>
<script type="text/javascript" src="./js/seis/latlon.js"></script>
<script type="text/javascript" src="./js/seis/getNowTime.js"></script>
<script type="text/javascript" src="./js/seis/map.js"></script>
<script type="text/javascript" src="./js/seis/changemode.js"></script>


<!--map控制圖表目錄-->
<script>
  document.querySelector('#filter').style.display = "none";


  let selectCatlog = (catlog) => {
    let waveform = document.getElementById('iframe').contentWindow.document;
    let selector = waveform.querySelector("#form-chart #catalog");
    let option = Array.from(selector.children).find(option => option.text === catlog);

    if (option) {
      selector.selectedIndex = option.value;
      selector.dispatchEvent(new Event('change'));
    };

  };
</script>

</html>