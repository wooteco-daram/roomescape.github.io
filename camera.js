(() => {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  const width = 1920; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  let streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.

          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    startbutton.addEventListener(
      "click",
      (ev) => {
        let startbutton = document.getElementById("startbutton");
        startbutton.style.display = "none";
        setTimeout(() => {
          takepicture();
          let startbutton = document.getElementById("startbutton");
          startbutton.style.display = "block";
        }, 3000);
        ev.preventDefault();
      },
      false
    );

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.scale(-1, 1); // 좌우 반전
    context.translate(-canvas.width, 0); // 좌우 반전
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;

      context.scale(-1, 1); // 좌우 반전
      context.translate(-width, 0); // 좌우 반전
      context.drawImage(video, 0, 0, width, height);

      context.scale(-1, 1); // 좌우 반전
      context.translate(-width, 0); // 좌우 반전

      context.font = "bold 64px AppleSDGothicNeo-Bold";
      context.lineWidth = 2;

      context.strokeText(
        document.querySelector("#hidden_theme").value,
        50,
        100
      );
      context.strokeText(document.querySelector("#hidden_time").value, 50, 175);

      context.scale(-1, 1); // 좌우 반전
      context.translate(-width, 0); // 좌우 반전

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);

      canvas.toBlob(
        function (blob) {
          var blobUrl = URL.createObjectURL(blob);

          if (document.querySelector("a") == null) {
            var link = document.createElement("a");
            document.body.appendChild(link);
          }

          var link = document.querySelector("a");
          link.href = blobUrl;
          link.download = new Date() + ".jpg";
          link.innerHTML = "Click here to download the file";
          link.display = "none";
          link.click();
        },
        "image/jpeg",
        1
      );
    } else {
      clearphoto();
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener("load", startup, false);
})();
