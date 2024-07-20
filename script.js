let videoIndexValue = 0;
let videoObjects = [];
let videos = [];
let loading = false;
const videoIndex_KEY = "YCP_videoIndex";
const videoList_KEY = "YCP_videoList";
const api_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails%2CcontentDetails&maxResults=50&playlistId=" +
    "PLAYLIST_ID" + //Playlist ID. Go to a Youtube Channel, hit share and hit copy Channel ID. ID will start with UC, replace with UU.
    "&key=" + 
    "REPLACE-STRING"; //Youtube API v3 Key.
const ytVideoUrl = "https://www.youtube.com/embed/";


document.addEventListener("DOMContentLoaded", function() {
    const buttonL = document.getElementById("buttonL");
    const buttonR = document.getElementById("buttonR");
    const loadButton = document.getElementById("loadButton");
    
    loadVideos();
    updateVideoIndexView();
    readVideoIndex();

    buttonL.addEventListener("click", function() {
        navigateTo(-1);
    });
    buttonR.addEventListener("click", function() {
        navigateTo(1);
    });
    loadButton.addEventListener("click", function() {
        videoObjects = [];
        setLoading(true);
        loadVideosFromAPI();
    });

    const loader = document.getElementById("loader");
    loader.style.display = "none";
});

function navigateTo(i) {
    if(i > 0) {
        videoIndexValue++;
    }

    if(i < 0) {
        videoIndexValue--;
    }

    if(videoIndexValue < 1 || videoIndexValue >= videos.length) videoIndexValue = 1;

    updateVideoIndex();
    updateVideoIndexView();
}

function readVideoIndex() {
    const savedIndex = localStorage.getItem(videoIndex_KEY);
    if(savedIndex) {
        videoIndexValue = savedIndex;
        return savedIndex;
    } 
    localStorage.setItem(videoIndex_KEY, 1);
    return 1;
}

function updateVideoIndex() {
    localStorage.setItem(videoIndex_KEY, videoIndexValue);
}

function updateVideoIndexView() {
    const videoIndex = document.getElementById("videoIndex");
    if(videoIndexValue == 0) readVideoIndex();

    videoIndex.textContent = `${videoIndexValue} / ${videos.length}`;
    showVideo();
}

function loadVideosFromAPI(pageToken = '') {
    fetch(api_url + `&pageToken=${pageToken}`)
        .then(response => response.json())
        .then(data => {
            data.items.forEach(item => {
                console.log(item);
                const videoId = item.contentDetails.videoId;
                videoObjects.push(videoId);
            });

            if (data.nextPageToken) {
                loadVideosFromAPI(data.nextPageToken);
            } else {
                saveVideos();
                loadVideos();
                updateVideoIndexView();
                setLoading(false);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function saveVideos() {
    videoObjects = videoObjects.reverse();
    localStorage.setItem(videoList_KEY, JSON.stringify(videoObjects));
}

function loadVideos() {
    videos = [];
    const loadedVideos = JSON.parse(localStorage.getItem(videoList_KEY, videoObjects));
    if(loadedVideos) {
        loadedVideos.forEach(v => {
            videos.push(v);
        });
    }
}

function showVideo() {
    const vidId = videos[videoIndexValue - 1];
    if(vidId) {
        const ytVidElement = document.getElementById("yt-iframe");
        ytVidElement.src = "https://www.youtube.com/embed/" + vidId;
    }
}

function setLoading(v) {
    const loader = document.getElementById("loader");
    const ytVidElement = document.getElementById("yt-iframe");

    if(v === true) {
        loader.style.display = "block";
        ytVidElement.style.display = "none";
    } else {
        loader.style.display = "none";
        ytVidElement.style.display = "block";
    }
}