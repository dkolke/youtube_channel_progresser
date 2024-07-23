const API_KEY = "<insert your API Key here>"; //Youtube API v3 Key.
const ycp_data_KEY = "YCP_DATA";
const videos_api_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails%2CcontentDetails&maxResults=50&playlistId=%PLAYLIST_ID%&key=" + API_KEY;
const playlist_api_url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=%PLAYLIST_ID%&key=" + API_KEY;
const ytVideoUrl = "https://www.youtube.com/embed/";

let loading = false;
let videoObjectsFromLastApiCall = [];
let ycpData = {
    playlists: [],
    currentPlaylistId: ""
}

document.getElementById("loader").style.display = "none";
document.getElementById("yt-iframe").style.display = "none";

document.addEventListener("DOMContentLoaded", function() {
    const buttonL = document.getElementById("buttonL");
    const buttonR = document.getElementById("buttonR");
    const updateListButton = document.getElementById("updateListButton");
    const addPlaylistButton = document.getElementById("addPlaylistButton");

    loadData();
    setDisabledLoadListButton();
    updatePlaylistSelection();
    updateVideoIndexView();

    buttonL.addEventListener("click", function() {
        navigateTo(-1);
    });
    buttonR.addEventListener("click", function() {
        navigateTo(1);
    });
    updateListButton.addEventListener("click", function() {
        videoObjectsFromLastApiCall = [];
        setLoading(true);
        loadVideosFromAPI();
    });
    addPlaylistButton.addEventListener("click", function() {
        setLoading(true);
        loadPlaylistFromAPI();
    });

    failSafe();
});

function navigateTo(i) {
    let videoIndexValue = getCurrentPlaylist().currentIndex;
    if(i > 0) {
        videoIndexValue++;
    }

    if(i < 0) {
        videoIndexValue--;
    }

    if(videoIndexValue < 1) videoIndexValue = 1;
    if(videoIndexValue > getCurrentPlaylist().videos.length) videoIndexValue = getCurrentPlaylist().videos.length - 1;
    getCurrentPlaylist().currentIndex = videoIndexValue;
    updateVideoIndexView();
    saveData();
}

function updateVideoIndexView() {
    const videoIndex = document.getElementById("videoIndex");
    if(ycpData.currentPlaylistId !== "" && getCurrentPlaylist().videos.length > 0) {
        videoIndex.textContent = `${getCurrentPlaylist().currentIndex + 1} / ${getCurrentPlaylist().videos.length}`;
        showVideo();
    } else {
        videoIndex.textContent = "0 / 0";
    }
    setVideoDisplay();
}

function loadVideosFromAPI(pageToken = '') {
    fetch(videos_api_url.replace("%PLAYLIST_ID%", ycpData.currentPlaylistId) + `&pageToken=${pageToken}`)
        .then(response => response.json())
        .then(data => {
            let alreadyIn = false;
            data.items.forEach(item => {
                if(alreadyIn) return;
                console.log(item);
                const videoId = item.contentDetails.videoId;
                videoObjectsFromLastApiCall.push(videoId);
                alreadyIn = getCurrentPlaylist().videos.includes(videoId);
            });

            if (data.nextPageToken && !alreadyIn) { //If a video is already added, subsequent calls won't have new videos
                loadVideosFromAPI(data.nextPageToken);
            } else {
                onLoadVideosFromApiEnd();
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function onLoadVideosFromApiEnd() {
    videoObjectsFromLastApiCall = videoObjectsFromLastApiCall.reverse();
    if(getCurrentPlaylist().currentIndex === -1) getCurrentPlaylist().currentIndex = 0;
    videoObjectsFromLastApiCall.forEach(v => {
        getCurrentPlaylist().videos.push(v);
    });
    updateVideoIndexView();
    saveData();
    setLoading(false);
}

function loadPlaylistFromAPI() {
    let playListId = document.getElementById('addPlaylistInput').value;
    if(playListId.substring(0, 2) == "UC") playListId = "UU" + playListId.substring(2);

    console.log(ycpData.playlists.findIndex(p => p.id === playListId))

    if(playListId && ycpData.playlists.findIndex(p => p.id === playListId) === -1) {
        fetch(playlist_api_url.replace("%PLAYLIST_ID%", playListId))
            .then(response => response.json())
            .then(data => {
                const name = data.items[0].snippet.title;
                if(name) {
                    ycpData.playlists.push({
                        id: playListId,
                        name: name,
                        currentIndex: -1,
                        videos: []
                    });
                    saveData();
                    updatePlaylistSelection();
                }
                setLoading(false);
                clearInput();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    } else {
        setLoading(false);
        clearInput();
    }
}

function loadData() {
    const loaded = JSON.parse(localStorage.getItem(ycp_data_KEY));
    if(!loaded) {
        saveData();
    }
    ycpData = JSON.parse(localStorage.getItem(ycp_data_KEY));
}

function saveData() {
    localStorage.setItem(ycp_data_KEY, JSON.stringify(ycpData));
}

function updatePlaylistSelection() {
    const playlistsSelect = document.getElementById("playlistsSelect");
    while (playlistsSelect.firstChild) {
        playlistsSelect.removeChild(playlistsSelect.firstChild);
    }

    for(let i = 0; i < ycpData.playlists.length; i++) {
        var opt = document.createElement('option');
        opt.value = ycpData.playlists[i].id;
        opt.innerHTML = ycpData.playlists[i].name;
        playlistsSelect.appendChild(opt);
    }

    playlistsSelect.value = ycpData.currentPlaylistId;
}

function playlistChanged() {
    var e = document.getElementById("playlistsSelect");
    var value = e.value;
    var text = e.options[e.selectedIndex].text;
    ycpData.currentPlaylistId = value;
    setDisabledLoadListButton();
    saveData();
    updateVideoIndexView();
}

function getCurrentPlaylist() {
    return ycpData.playlists.find(p => p.id == ycpData.currentPlaylistId);
}

function setDisabledLoadListButton() {
    const updateListButton = document.getElementById("updateListButton");
    updateListButton.disabled = ycpData.currentPlaylistId === "";
}

function showVideo() {
    const vidId = getCurrentPlaylist().videos[getCurrentPlaylist().currentIndex];
    if(vidId) {
        const ytVidElement = document.getElementById("yt-iframe");
        ytVidElement.src = "https://www.youtube.com/embed/" + vidId;
    }
}

function clearInput() {
    const input = document.getElementById('addPlaylistInput');
    input.value = "";
}

function setLoading(v) {
    const loader = document.getElementById("loader");
    const ytVidElement = document.getElementById("yt-iframe");

    if(v === true) {
        loader.style.display = "block";
        ytVidElement.style.display = "none";
    } else {
        loader.style.display = "none";
        const showVideo = getCurrentPlaylist() && getCurrentPlaylist().videos.length > 0;
        ytVidElement.style.display = showVideo ? "block" : "none";
    }
}

function setVideoDisplay() {
    const ytVidElement = document.getElementById("yt-iframe");
    const novideosText = document.getElementById("novideosText");
    
    const showVideo = getCurrentPlaylist() && getCurrentPlaylist().videos.length > 0;

    if(showVideo === true) {
        novideosText.style.display = "none";
        ytVidElement.style.display = "block";
    } else {
        novideosText.style.display = "block";
        ytVidElement.style.display = "none";
    }
}

function failSafe() {
    if(API_KEY === "<insert your API Key here>") { //DONT CHANGE THIS
        alert("API Key not set!");
    }
}