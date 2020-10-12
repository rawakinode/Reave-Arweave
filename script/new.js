//VARIABLES
var cg ;
var imgBase64 ;
var cntn ;

// QUILLS EDITORS
var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    ['link'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'align': [] }],
    ['image'],
    ['video'],
  
    ['clean']                                         // remove formatting button
  ];
  
  var quill = new Quill('#editor', {
    modules: {
      toolbar: toolbarOptions
    },
      theme: 'snow',
      placeholder: 'Write Story Here ...'
  });

  // GET QUILS DATA
  async function getQuilsData() {
    var delta = quill.getContents();
    cntn = quill.root.innerHTML;
  }

  //TITLE FOCUS
  document.getElementById("title").focus();

  //CATEGORY SELECT UNSELECT
  function selectCategory(e) {

    cg = e;
      var elms = document.querySelectorAll("[class='category-id']");
      
      for (let index = 0; index < elms.length; index++) {
          elms[index].style.backgroundColor = 'lightsalmon';      
      }

      document.getElementById(e).style.backgroundColor = 'black';

  }

  //THUMBNAIL
  function openfile() {
      document.getElementById('inputfile').click();
  }

  function fileproses(files) {
    var fr = new FileReader()
    fr.onload = function (ev) {
        try {

            //console.log(ev.target.result);
             $( "#inputfile" ).load(window.location.href + " #inputfile" );
            imgBase64 = ev.target.result;
            document.getElementById("showCover").src = ev.target.result;

            var canvas = document.getElementById('canvasx');
            var context = canvas.getContext("2d");
            var image = new Image();
            image.onload = function() {
                  canvas.width = 800;
                  canvas.height = (800 * image.height) / image.width;
                //context.clearRect(0, 0, 600, (600 * canvas.height) / canvas.width);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

            	var newcan = document.getElementById('canvasx');
                imgBase64 = newcan.toDataURL('image/jpeg', 0.3);
                
                console.log(imgBase64);
                $('#addcover').hide();
                $('#removethumbnail').show();
                var cs = '<img src="'+imgBase64+'" id="imgsh" style="width:100%;"/>';
                $('#showCover').append(cs);

            };
            image.src = ev.target.result;

        } catch (err) {
            alert('Error logging in: ' + err)
        }
    }
    fr.readAsDataURL(files[0])
  }

  function removethumbnail() {
    $('#showCover').empty();
    $('#addcover').show();
    $('#removethumbnail').hide();
  }

  //OPEN POPUP
  function openPopUp(x,y,z) {
     document.getElementById('poptitle').innerText = x;
     document.getElementById('no').setAttribute('onclick',y);
     document.getElementById('yes').setAttribute('onclick',z);
     $('#popup').fadeIn('300');
  }

  //CLOSE POPUP
  function closePopUp() {
     $('#popup').fadeOut('300');
  }

  //PUBLISH STORY
  async function nextPublish() {
     await closePopUp();
  }