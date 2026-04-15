//////////////////////////////////////////////////////////////////////////////////
// 506 Chinese Traditional SDA Hymnal Progressive Web App (PWA)
// 506讚美詩
// Copyright 2026 Enoch Hwang

const APP_NAME = "Chinese_Traditional";
var currentListPages = NUMERIC_PAGES; // initial list


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Initialize Swiper
var swiper = new Swiper(".swiper", {
    zoom: {
        maxRatio: 5,
        minRatio: 1,
        toggle: false // DISABLE Double-Tap Zoom (Crucial for Long Press)
    },
    grabCursor: true,
    speed: 500,
    virtual: {
      renderSlide: function (title, index) {
        /*  <div> format
        <div class="swiper-slide">
          <div class="swiper-zoom-container">
            <img src="songsheets/1 Praise to the Lord.png">
          </div>
        </div>
        */
        const swiper_slide = document.createElement('div');
        swiper_slide.className = 'swiper-slide';
        const swiper_zoom = document.createElement('div');
        swiper_zoom.className = 'swiper-zoom-container';
        const img = document.createElement('img');
        img.src = `songsheets/${title}.png`;
        img.alt = title;
        img.dataset.title = title;  // IMPORTANT: Store the title here so the Wrapper can find it later
        swiper_zoom.appendChild(img);
        swiper_slide.appendChild(swiper_zoom);
        return swiper_slide;
    }
  }
});

swiper.virtual.slides = currentListPages;  // populate swiper with the currentListPages
if (swiper.virtual.cache) swiper.virtual.cache = {};  // Clear the Virtual Cache
swiper.virtual.update();  // Update the Virtual Engine
swiper.update();          // Update the Swiper Layout


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Start of program. Execute this when program loads
window.addEventListener('load', async () => {
  console.log("Loading app");
  const savedList = localStorage.getItem(APP_NAME+"_currentListPages");
  const savedIndex = localStorage.getItem(APP_NAME+"_swiperindex");

  if (!savedList || !savedIndex) {
      // --- FIRST TIME RUN ---
      console.log("First time run! Defaulting to index 0.");
      //swiper.slideTo(0, 0);
      localStorage.setItem(APP_NAME+"_swiperindex", 0);
      localStorage.setItem(APP_NAME+"_currentListPages", JSON.stringify(currentListPages));        
  } else {
      // --- SUBSEQUENT RUNS (Restore State) ---
      console.log("Restoring previous state...");
      currentListPages = JSON.parse(savedList);
      
      // Re-populate Swiper with the last known list
      swiper.virtual.removeAllSlides();
      swiper.virtual.slides = currentListPages;
      if (swiper.virtual.cache) swiper.virtual.cache = {}; 
      swiper.virtual.update();
      swiper.update();
      
      // Jump to the specific song
      swiper.slideTo(parseInt(savedIndex), 0);
  }
});

/*
// May be this is overkill
// Save state whenever the slide changes (More reliable than visibilitychange)
swiper.on('slideChange', () => {
    localStorage.setItem('swiperindex', swiper.activeIndex);
    localStorage.setItem('currentListPages', JSON.stringify(currentListPages));
});
*/

// This is triggered when the app is moved to the background or brought back to the front
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === "visible") {
    // Re-request wake lock if it was active
    if (wakeLock !== null) {
      await requestWakeLock();
    }
  } else {
    // Final safety save state when app goes to background
    localStorage.setItem(APP_NAME+"_swiperindex", swiper.activeIndex);
    localStorage.setItem(APP_NAME+"_currentListPages", JSON.stringify(currentListPages));
  }
});


// After adding the slides, you MUST do a swiper update
// The Swiper MUST be created here AFTER adding the slides
// If created BEFORE then must do
// swiper.update();

/*
const slide = document.createElement('div');
slide.className = 'swiper-slide';

const img = document.createElement('img');
img.src = 'songsheets/SomeSong.png';
slide.appendChild(img);

// Optional: Add your long press handler
slide.addEventListener('touchstart', ...);

swiper.appendSlide(slide.outerHTML);

swiper.appendSlide('<div class="swiper-slide">New Slide</div>');
swiper.prependSlide('<div class="swiper-slide">First Slide</div>');
swiper.addSlide(3, '<div class="swiper-slide">Slide at index 3</div>');
swiper.removeSlide(3);
swiper.removeSlide([2, 4, 6]);
swiper.removeAllSlides();

*/


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Menu bar buttons
function onMenuPress(id) {
  addBookmarkMenuOverlay.style.display = "none";  // hide the Add Bookmark Menu
  //console.log(`Menu button ${id} pressed`);
  //alert(`Menu button ${id} pressed`);
  switch(id) {
    case 'icon': { // app icon
      numericList.style.display = 'none';
      numericListSidebar.style.display = 'none';
      alphabeticList.style.display = 'none';
      alphabeticListSidebar.style.display = 'none';
      strokeList.style.display = 'none';
      strokeListSidebar.style.display = 'none';
      bookmarkListContainer.style.display = 'none';
      moreMenuOverlay.style.display = 'none';
      
      stopAudio();
      closeSearch();  // clear search bar if currently being displayed
      
      // go to page 1 of current song
      // get songname
      let currentFullTitle = currentListPages[swiper.activeIndex];
      if (currentFullTitle) {
        // extract number at the end for multi-page
        // \d+ matches one or more digits
        // $ ensures they are at the very end of the string
        let baseSongName = currentFullTitle.replace(/\d+$/, '');

        // Find the index of the very first page for this song in the current list
        let firstPageIndex = currentListPages.findIndex(name => name === baseSongName);

        // If we found it and we aren't already there, slide to it
        if (firstPageIndex !== -1 && firstPageIndex !== swiper.activeIndex) {
            swiper.slideTo(firstPageIndex, 0);
        }
      }
      break;
    }
    
    case 'search': { // search
      moreMenuOverlay.style.display = 'none';
      navIcons.style.display = 'none';
      searchBarContainer.style.display = 'flex';
      searchInput.focus(); // Automatically pull up keyboard
      // Small delay to allow keyboard animation to start
      setTimeout(adjustSearchListHeight, 100);
      break;
    }
    
    case 'numeric': { // numeric list
      moreMenuOverlay.style.display = 'none';
      currentListPages = NUMERIC_PAGES;
      if (numericList.style.display === 'none') {  // is the list hidden?
        numericList.style.display = 'block';
        numericListSidebar.style.display = 'flex';
      } else {
        numericList.style.display = 'none';
        numericListSidebar.style.display = 'none';
      }
      // hide the other lists
      alphabeticList.style.display = 'none';
      alphabeticListSidebar.style.display = 'none';
      strokeList.style.display = 'none';
      strokeListSidebar.style.display = 'none';
      bookmarkListContainer.style.display = 'none';
      searchList.style.display = 'none';
      moreMenuOverlay.style.display = 'none';
      break;
    }
    
    case 'alphabetic': { // alphabetic list
      currentListPages = ALPHABETIC_PAGES;
      if (alphabeticList.style.display === 'none') {  // is the list hidden?
        alphabeticList.style.display = 'block';
        alphabeticListSidebar.style.display = 'flex';
      } else {
        alphabeticList.style.display = 'none';
        alphabeticListSidebar.style.display = 'none';
      }
      // hide the other lists
      numericList.style.display = 'none';
      numericListSidebar.style.display = 'none';
      strokeList.style.display = 'none';
      strokeListSidebar.style.display = 'none';
      bookmarkListContainer.style.display = 'none';
      searchList.style.display = 'none';
      moreMenuOverlay.style.display = 'none';
      break;
    }
    
    case 'stroke': { // stroke list
      currentListPages = STROKE_PAGES;
      if (strokeList.style.display === 'none') {  // is the list hidden?
        strokeList.style.display = 'block';
        strokeListSidebar.style.display = 'flex';
      } else {
        strokeList.style.display = 'none';
        strokeListSidebar.style.display = 'none';
      }
      // hide the other lists
      numericList.style.display = 'none';
      numericListSidebar.style.display = 'none';
      alphabeticList.style.display = 'none';
      alphabeticListSidebar.style.display = 'none';
      bookmarkListContainer.style.display = 'none';
      searchList.style.display = 'none';
      moreMenuOverlay.style.display = 'none';
      break;
    }

    case 'bookmark': { // bookmark list
      if (bookmarkListContainer.style.display === 'none') {
        bookmarkListContainer.style.display = 'flex'; // Use flex, not block!
        createBookmarkList(); 
      } else {
        bookmarkListContainer.style.display = 'none';
      }
      numericList.style.display = 'none';
      numericListSidebar.style.display = 'none';
      alphabeticList.style.display = 'none';
      alphabeticListSidebar.style.display = 'none';
      strokeList.style.display = 'none';
      strokeListSidebar.style.display = 'none';
      searchList.style.display = 'none';
      moreMenuOverlay.style.display = 'none';
      break;
    }
    
    case 'play': { // play
      moreMenuOverlay.style.display = 'none';
      openMusicPlayer();
      break;
    }
    
    case 'more': { // setup
      if (moreMenuOverlay.style.display === 'block') {
          moreMenuOverlay.style.display = 'none';
      } else {
          moreMenuOverlay.style.display = 'block';
      }
      break;      
    }
    
    default:
      break;
  }
}

        
//////////////////////////////////////////////////////////////////////////////////
// More (three-dots) Popup Menu stuff
var moreMenuOverlay = document.getElementById('moreMenuOverlay');

function handleMoreAction(action) {
  numericList.style.display = 'none';
  numericListSidebar.style.display = 'none';
  alphabeticList.style.display = 'none';
  alphabeticListSidebar.style.display = 'none';
  strokeList.style.display = 'none';
  strokeListSidebar.style.display = 'none';
  bookmarkListContainer.style.display = 'none';
  moreMenuOverlay.style.display = 'none';
    
  switch(action) {
    case 'import':
      showToast("即將推出導入歌曲功能");  // Import songs coming soon
      break;
    case 'share':
      if (navigator.share) {
        navigator.share({ title: '506讚美詩', url: window.location.href });  // 506 Chinese Traditional SDA Hymnal
      }
      break;
    case 'updates':
      if (newWorker) {
        newWorker.postMessage({ action: 'update' });  // send message to service worker
        // execution continues in the service worker sw.js addEventListener('message' handler
        const updateItem = document.getElementById('updateMenuItem');
        if (updateItem) {
          updateItem.style.display = 'none'; // remove update item from menu
        }
      }
      showToast("應用程式已更新");   // App updated
      closeMoreMenu();
      break;
    case 'moreapps':
      window.open('https://hwang.lasierra.edu/~enoch/Apps', '_blank');
      break;
    case 'settings':
      showToast("設定功能即將推出");  // Settings coming soon
      break;
    case 'help':
      swiper.virtual.removeAllSlides();
      swiper.virtual.slides = NUMERIC_PAGES;  // populate swiper with NUMERIC_PAGES (default)  
      currentListPages = NUMERIC_PAGES;
      swiper.virtual.update();    
      swiper.slideTo(0, 0); // jump to page 0 About page
      break;
  }
}

function closeMoreMenu() {
    moreMenuOverlay.style.display = 'none';
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Displays the song given the songname string
// and the global variable currentListPages
// Called by Numeric, Alphabetic, Bookmarks, and Search.
// songname format either "468 A Child of the King" (for NUMERIC_INDEX) or 
// "A Child of the King 310 AH468" (for ALPHABETIC_INDEX)
// Called by NUMERIC_INDEX.forEach, ALPHABETIC_INDEX.forEach, STROKE_INDEX.forEach, handleBookmarkSelect, renderSearchList
/*
// original
function displaySong(songname) {
  // Regex:
  // use /^(\d+)/	to extract digits at the beginning for Numeric List "310 A Child of the King"
  // use /(\d+)$/	to extract digits at the end for Alphabetic List "A Child of the King 310"
  // use /(\d+)$/	to extract first group of digits from the left for Alphabetic List "A Child of the King 310 AH468"
  // use /(\d+)/	to extract digits anywhere for Search/Bookmarks (Safe fallback)
  // 1. First try extracting the number from the beginning as in "310 A Child of the King"
  //let match = songname.match(/^(\d+)/);
  // Extract the FIRST number (310) from the BEGINNING as in "A Child of the King 310 AH468"
  let match = songname.match(/\d+/);
  //if (!match) { // number not at beginning
    // Extract the number from the end as in "A Child of the King 468"  
    // match = songname.match(/(\d+)$/);
  //}
  const songNumber = match[0];
  // 2. Create the target filename search string (e.g., "2h")
  const targetFilename = songNumber + 'h';
  // 3. Find index in currentListPages where the string is exactly the number + 'h'
  // Or use .startsWith() if the filename has more text after 'h'
  const pageIndex = currentListPages.findIndex(name => name === targetFilename || name.startsWith(targetFilename));
  
  if (pageIndex !== -1) {
    // 4. Update Swiper state
    swiper.virtual.removeAllSlides();
    swiper.virtual.slides = currentListPages;
    if (swiper.virtual.cache) swiper.virtual.cache = {};  // Clear the Virtual Cache
    swiper.virtual.update();  // Update the Virtual Engine
    swiper.update();          // Update the Swiper Layout
    
    // 5. Slide to the page
    swiper.slideTo(pageIndex, 0);
  } else {
    console.error("Could not find page for song number:", songNumber);
  }
}
*/
function displaySong(songname, pageIndex) {
  // do the following only if not given the pageIndex from attachListItemEventHandler and renderSearchList
  if (pageIndex == -1) {
    // use /(\d+)/	to extract the first sequence of digits starting from the left, so will do both of the above, i.e., number at beginning or middle or end
    const match = songname.match(/\d+/);  // extract the song number
    const songNumber = match[0];
    let targetFilename = songNumber + 'h';   // create the target filename search string (e.g., "2h")
    pageIndex = currentListPages.findIndex(name => name === targetFilename || name.startsWith(targetFilename));

    if (pageIndex == -1) { // song is not in currentListPages
      // see if it is in My Songs by using the songname as is
      targetFilename = songname;
      pageIndex = currentListPages.findIndex(name => name === targetFilename || name.startsWith(targetFilename));
    }
  }
  
  if (pageIndex !== -1) { // found the song
    // Update Swiper state
    swiper.virtual.removeAllSlides();
    swiper.virtual.slides = currentListPages;
    if (swiper.virtual.cache) swiper.virtual.cache = {};  // Clear the Virtual Cache
    swiper.virtual.update();  // Update the Virtual Engine
    swiper.update();          // Update the Swiper Layout
    
    // Slide to the page
    swiper.slideTo(pageIndex, 0);
  } else {
    console.error("Could not find page for: ", songname);
  }
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Lists stuff
// Create the Numeric, Alphabetic, and Stroke lists
var numericList = document.getElementById('numericList');
var numericListSidebar = document.getElementById('numericListSidebar');
var alphabeticList = document.getElementById('alphabeticList');
var alphabeticListSidebar = document.getElementById('alphabeticListSidebar');
var strokeList = document.getElementById('strokeList');
var strokeListSidebar = document.getElementById('strokeListSidebar');
var bookmarkList = document.getElementById('bookmarkList');
var bookmarkListContainer = document.getElementById('bookmarkList-container');


//////////////////////////////////////////////////////////////////////////////////
NUMERIC_INDEX.forEach((songname, index) => {
  const item = document.createElement('div');
  item.className = 'list-item';
  item.textContent = songname;
  /*
  // Automatic create the fast scroll sidebar group label mapping to the list index
  // The group by hundred must match the code in createFastScroll function
  const match = songname.match(/^\d+/);  // extract number at the beginning like "1 Praise to the Lord"
  const songNumber = match ? parseInt(match[0], 10) : 0;
  if (songNumber > 0) {
    // this is for increments of 100
    const groupHundred = Math.floor(songNumber / 100) * 100;
    item.setAttribute('data-group-numeric', groupHundred);
  }
  */
  attachListItemEventHandler(item, songname); // attached the touch and mouse event handlers for this song
  
  numericList.appendChild(item);        // add item to numeric list
});


//////////////////////////////////////////////////////////////////////////////////
ALPHABETIC_INDEX.forEach((songname, index) => {
  const item = document.createElement('div');
  item.className = 'list-item';
  item.textContent = songname;
  /*
  // Automatic create the fast scroll sidebar group label mapping to the list index
  let firstChar = songname.charAt(0).toUpperCase();  // get the first character of song name
  // If not a letter then second character must be a letter
  if (!/^[A-Z]$/.test(firstChar)) {
    firstChar = songname.charAt(1).toUpperCase();
  }
  // set the attribute needed in querySelector in the createFastScroll/handleScroll logic
  item.setAttribute('data-group-alphabetic', firstChar);
  */
  attachListItemEventHandler(item, songname); // attached the touch and mouse event handlers for this song

  alphabeticList.appendChild(item);     // add item to allphabetic list
});


//////////////////////////////////////////////////////////////////////////////////
STROKE_INDEX.forEach((songname, index) => {
  const item = document.createElement('div');
  item.className = 'list-item';
  item.textContent = songname;

  attachListItemEventHandler(item, songname); // attached the touch and mouse event handlers for this song

  strokeList.appendChild(item);     // add item to stroke list
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// FastScroll
// Manual create the fast scroll sidebar group label mapping to the list index
// The list index is zero based
// Format: [group label, list index for the start of the group]
const numericListScrollMap = new Map([
  ["000", 0],
  ["100", 99],
  ["200", 199],
  ["300", 299],
  ["400", 399],
  ["500", 499],
  ["RR", 506]
]);

const alphabeticListScrollMap = new Map([
  ["A", 0],
  ["B", 32],
  ["C", 55],
  ["D", 71],
  ["E", 85],
  ["F", 88],
  ["G", 103],
  ["H", 121],
  ["I", 163],
  ["J", 218],
  ["K", 248],
  ["L", 249],
  ["M", 281],
  ["N", 300],
  ["O", 316],
  ["P", 355],
  ["R", 370],
  ["S", 378],
  ["T", 413],
  ["U", 484],
  ["V", 486],
  ["W", 488],
  ["Y", 541]
]);

const strokeListScrollMap = new Map([
  ["一畫", 0],
  ["二畫", 4],
  ["三畫", 5],
  ["四畫", 14],
  ["五畫", 32],
  ["六畫", 93],
  ["七畫", 131],
  ["八畫", 207],
  ["九畫", 243],
  ["十畫", 283],
  ["十一畫", 307],
  ["十二畫", 342],
  ["十三畫", 366],
  ["十四畫", 414],
  ["十五畫", 442],
  ["十六畫", 456],
  ["十七畫", 465],
  ["十八畫", 470],
  ["十九畫", 474],
  ["二十畫以上", 481],
  ["啟應經文", 506]
]);


//////////////////////////////////////////////////////////////////////////////////
// Initialize the fast scroll sidebars
// (Make sure NUMERIC_INDEX and ALPHABETIC_INDEX are loaded before running this)
createFastScroll('numericListSidebar', 'numericList', 'data-group-numeric', NUMERIC_INDEX);
createFastScroll('alphabeticListSidebar', 'alphabeticList', 'data-group-alphabetic', ALPHABETIC_INDEX);
createFastScroll('strokeListSidebar', 'strokeList', 'data-group-alphabetic', STROKE_INDEX);


// Create the fast scroll sidebar
function createFastScroll(sidebarId, listId, dataAttribute, itemsArray) {
  const sidebar = document.getElementById(sidebarId);
  const list = document.getElementById(listId);
  const container = document.querySelector('.songsheet-container'); 
  let isDragging = false; 

  // 1. SELECT THE CORRECT MAP
  let activeMap;
  if (sidebarId === 'numericListSidebar') {
    activeMap = numericListScrollMap;
  } else if (sidebarId === 'alphabeticListSidebar') {
    activeMap = alphabeticListScrollMap;
  } else {
    activeMap = strokeListScrollMap;
  }
  
  // 2. CREATE BUBBLE (Visual Feedback)
  let bubble = document.getElementById(sidebarId + '-bubble');
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.id = sidebarId + '-bubble';
    bubble.className = 'fast-scroll-bubble';
    container.appendChild(bubble);
  }

  // 3. GENERATE GROUPS AUTOMATICALLY FROM MAP KEYS
  const groups = Array.from(activeMap.keys());

  // 4. RENDER SIDEBAR ITEMS
  sidebar.innerHTML = '';
  groups.forEach(label => {
    const div = document.createElement('div');
    div.className = 'fast-scroll-item';
    div.innerText = label;
    div.dataset.target = label;
    sidebar.appendChild(div);
  });

  // 5. THE SCROLL HANDLER
  const handleScroll = (e) => {
    if (!isDragging) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const firstChild = sidebar.firstElementChild.getBoundingClientRect();
    const lastChild = sidebar.lastElementChild.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const labelAreaTop = firstChild.top;
    const labelAreaHeight = lastChild.bottom - firstChild.top;
    let relativeY = clientY - labelAreaTop;
    
    // Determine which label is under the finger
    let index;
    if (relativeY <= 0) {
        index = 0;
    } else {
        const percent = Math.max(0, Math.min(relativeY / labelAreaHeight, 0.999));
        index = Math.floor(percent * groups.length);
    }
    
    const char = groups[index];

    if (char !== undefined && char !== null) {
      // Update Bubble Text & Position
      bubble.innerText = char;
      let bubbleY = clientY - containerRect.top;
      bubbleY = Math.max(30, Math.min(bubbleY, containerRect.height - 30));
      bubble.classList.add('show');
      bubble.style.transform = `translateY(${bubbleY - 30}px)`;

      // SCROLL LOGIC USING THE MAP
      const itemIndex = activeMap.get(char);
      
      if (itemIndex !== undefined) {
        const targetListItem = list.children[itemIndex];
        if (targetListItem) {
          // Precise scroll using offsetTop for smoother performance
          list.scrollTop = targetListItem.offsetTop;
        }
      }
    }

    if (e.cancelable) e.preventDefault();
  };

  // 6. EVENT LISTENERS
  const startDragging = (e) => {
    isDragging = true;
    if (typeof closeSearch === "function") closeSearch(); 
    handleScroll(e);
  };

  const stopDragging = () => {
    isDragging = false;
    bubble.classList.remove('show');
  };

  sidebar.addEventListener('mousedown', startDragging);
  sidebar.addEventListener('touchstart', startDragging, { passive: false });

  window.addEventListener('mousemove', (e) => { if (isDragging) handleScroll(e); });
  window.addEventListener('touchmove', (e) => { 
    if (isDragging) handleScroll(e); 
  }, { passive: false });

  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchend', stopDragging);
  window.addEventListener('touchcancel', stopDragging);
} // end createFastScroll


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Handle gestures for the Add Bookmark menu popup window
const swiperWrapper = document.querySelector('.swiper-wrapper');
const addBookmarkMenuOverlay = document.getElementById('addBookmarkMenuOverlay');
let longPressTimer = null;
let startX = 0;
let startY = 0;

// Handle longpress on songsheet to show add bookmark popup window
swiperWrapper.addEventListener('pointerdown', (e) => {
  if (!e.isPrimary) {	 // Ignore multi-touch
    clearTimeout(longPressTimer);
    longPressTimer = null;
    return;
  }
  if (swiper.zoom && swiper.zoom.scale > 1) { // Ignore when zoomed in
    clearTimeout(longPressTimer);
    longPressTimer = null;
    return;
  }
  // Prevent the browser's default "drag image" behavior 
  // which iPad often confuses with zooming
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }

  addBookmarkMenuOverlay.style.display = 'none';	// Hide menu if it's already open

  startX = e.clientX;
  startY = e.clientY;
  
  longPressTimer = setTimeout(() => {
    // --- LONG PRESS ADD BOOKMARK LOGIC ---
    const index = swiper.activeIndex; // get the current active index
    const page = swiper.virtual.slides[index]; // get the page
    const songname = pages2Index(page);
    if (songname) {
      addBookmarkMenuOverlay.dataset.songname = songname; // pass songname to the addBookmarkMenuOverlay.addEventListener
      addBookmarkMenuOverlay.style.display = "flex";  // show Add Bookmark Menu popup window
      // execution continues with the addBookmarkMenuOverlay.addEventListener click events

    } else {
      // should never get here
      console.error("Could not find song title at index:", index, songname);
    }
  }, 700); // longpress hold time
});

// Prevent Default Context Menu
swiperWrapper.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});


// Touch Move (Cancel if swiping) for desktop
swiperWrapper.addEventListener('pointermove', (e) => {
  if (longPressTimer) {
    // If finger moves more than 10px, it's a swipe/pan, not a hold
    if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }
});

// Touch Move (Cancel if swiping) for tablet
swiperWrapper.addEventListener('touchmove', (e) => {
  if (longPressTimer) {
    // If finger moves more than 10px, it's a swipe/pan, not a hold
    if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }
}, {passive: false}); // this removed the warning but haven't tested for other side effects

// Touch End (Cancel)
swiperWrapper.addEventListener('pointerup', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
});

// Prevent longpress popup when vertical scroll in landscape mode
const container = document.querySelector('.songsheet-container');
container.addEventListener('scroll', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}, { passive: true });

// Go back to no zoom (1x) when device orientation change
window.addEventListener("orientationchange", () => {
  // Small delay ensures the browser has finished the rotation animation
  setTimeout(() => {
    if (swiper.zoom) {
      swiper.zoom.out();
    }
  }, 200);
});
    

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Add Bookmark Menu popup stuff
function saveBookmark(songname, folder) {
  // load existing bookmarks or null if none exists yet
  const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
  // ensure the folder exists
  if (!bookmarks[folder]) {
    bookmarks[folder] = [];
  }

  // add song to bookmark folder
  bookmarks[folder].push(songname);

  // save back to localStorage
  localStorage.setItem(APP_NAME+"_bookmarks", JSON.stringify(bookmarks));

  // Refresh the bookmark list if songname is added to the current list
  if (currentBookmarkFolder === folder) {
    createBookmarkList(); // Re-populate the bookmark list for the newly selected folder
  }
}

// This event handler is called when one of the buttons in the Add Bookmark Menu is clicked
addBookmarkMenuOverlay.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const folder = e.target.dataset.folder; // Retrieve the folder name
    const songname = addBookmarkMenuOverlay.dataset.songname;  // Retrieve the song name that was clicked

    // songname format at this point can be either "12 Joyful, Joyful, We Adore Thee" or
    // "Joyful, Joyful, We Adore Thee 12"
    const formattedSongname = formatName(songname);  // Make songname format as "12 Joyful, Joyful, We Adore Thee"

    if (folder !== "Cancel") {
      saveBookmark(formattedSongname, folder);
      const s = folder.replace("Folder", "資料夾");
      showToast(`${formattedSongname} 已新增至 ${s}`); // added to folder 1 已新增至資料夾 1
    }
    
    addBookmarkMenuOverlay.style.display = "none"; // hide popup
  }
  
  // clicking outside popup also closes
  if (e.target === addBookmarkMenuOverlay) {
    addBookmarkMenuOverlay.style.display = "none";
  }
});
    

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Bookmark List stuff
let currentBookmarkFolder = "Folder 1";

// Disable system context menu (Download/Share) on bookmark folder tabs
document.addEventListener('contextmenu', function(e) {
  if (e.target.classList.contains('tab-btn')) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, false);

// Bookmark folder tabs switching and longpress logic
document.querySelectorAll('.tab-btn').forEach(button => {
  let longpressTimer;
  let isLongPress = false;

  const startPress = (e) => {
    isLongPress = false;
    longpressTimer = setTimeout(() => {
      // --- LONG PRESS FOLDER TAB ---
      isLongPress = true;
      const folderId = parseInt(button.getAttribute('bookmarkFolder'));
      handleFolderLongPress(folderId);
    }, 700); // Time in ms for long press
  };

  const endPress = (e) => {
    clearTimeout(longpressTimer);
    if (!isLongPress) {
      // --- CLICK FOLDER TAB ---
      const folderId = parseInt(button.getAttribute('bookmarkFolder'));
      selectFolder(folderId);
    }
  };

  const cancelPress = () => {
    clearTimeout(longpressTimer);
  };

  // Mouse Events
  button.addEventListener('mousedown', startPress);
  button.addEventListener('mouseup', endPress);
  button.addEventListener('mouseleave', cancelPress);

  // Touch Events
  button.addEventListener('touchstart', startPress, { passive: true });
  button.addEventListener('touchend', endPress);
  button.addEventListener('touchmove', cancelPress);
});

// This function runs when you long-press a folder tab
function handleFolderLongPress(folderId) {
  //const folderName = "Folder " + folderId;
  if (currentBookmarkFolder === "Folder " + folderId) {
    const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
    
    // SAFETY CHECK: Ensure the folder exists in the object and has items
    if (bookmarks[currentBookmarkFolder] && bookmarks[currentBookmarkFolder].length > 0) {
      
      const toast = document.getElementById('confirm-toast');
      document.getElementById('confirm-message').innerText = `清空文件夹 ${folderId}?`;  // Clear Folder 1?
      toast.classList.add('show');
      
      // Use { once: true } to prevent stacking multiple click listeners
      document.getElementById('confirmYesBtn').onclick = () => {  // YES to clear button clicked
        // Reload fresh data to be safe
        const currentBookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
        currentBookmarks[currentBookmarkFolder] = [];   // clear the folder items
        
        localStorage.setItem(APP_NAME+"_bookmarks", JSON.stringify(currentBookmarks)); // save back to localStorage
        createBookmarkList(); 
        toast.classList.remove('show');
        showToast("資料夾"+folderId+"已清理");  // Folder 1 cleared 資料夾 1 已清理
      };

      document.getElementById('confirmCancelBtn').onclick = () => { // Cancel clear button clicked
        toast.classList.remove('show');
      };
    }
  }
}

// This function runs when you press a folder tab
function selectFolder(folderId) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab, index) => {
    if (index === folderId - 1) {
      tab.classList.add('active');
      currentBookmarkFolder = "Folder "+folderId; // "Folder 1", "Folder 2", "Folder 3", or "Folder 4"
    } else {
      tab.classList.remove('active');
    }
  });

  createBookmarkList(); // Re-populate the list for the newly selected folder
}


///// Bookmark List - 
///// Part A: Structure the List
function createBookmarkList() {
  // retrieve bookmark folder items from local storage
  const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
  const currentBookmarkFolderItems = bookmarks[currentBookmarkFolder] || [];

  bookmarkList.innerHTML = '';

  // check for bookmark list empty
  if (currentBookmarkFolderItems.length === 0) {
    if (currentBookmarkFolder == "Folder 4") {
      bookmarkList.innerHTML = `<div style="padding: 20px; text-align: center; color: #888;">我的歌曲功能即將上線</div>`; // My Songs feature coming soon
    } else {
      bookmarkList.innerHTML = `<div style="padding: 20px; text-align: center; color: #888;">長按歌曲或索引即可加書籤</div>`; // Long press song or index to add bookmark
    }
    return;
  }

  /////////////////////////////////////////////////////////////////////////
  // Create the list dynamically
  // The format for each <li> item is:
  //  <li class="swipe-item">
  //  <div class="swipe-background">
  //    <img src="trash.png" alt="Trash"/>
  //  </div>
  //  <div class="swipe-content">
  //    Item 1
  //    <img class="drag-handle" src="drag.png" alt="Drag"/>
  //  </div>
  //  </li>

  currentBookmarkFolderItems.forEach((songname, folderIndex) => {
    const li = document.createElement('li');
    li.className = 'swipe-item';
    li.dataset.name = songname;
    li.dataset.index = folderIndex;

    li.innerHTML = `
      <div class="swipe-background">
        <img src="icons/ic_trash.png" alt="Trash">
      </div>
      <div class="swipe-content">
        <span class="bookmark-text">${songname}</span>
        <img class="drag-handle" src="icons/ic_drag.png" alt="Drag" draggable="false">
      </div>
    `;

    bookmarkList.appendChild(li);
  });
}

// Prevent browser default popup menu to save/share/open image when long press on drag handle
bookmarkList.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.drag-handle')) {
    e.preventDefault(); // block long-press image menu
  }
});


//////////////////////////////////////////////////////////////////////////////////
///// Bookmark List - 
///// Part B: The Gesture Handlers for the bookmark list items
// setup touch and mouse actions for swipe to delete and drag to reorder
let swipeStartX = 0;
let swipeStartY = 0;
let offsetY = 0;

let isHorizontal = null;
let swipeItem = null;
let swipeContent = null;
let isSwiping = false;
const swipeThreshold = 100; //250; // how much to swipe
let lastDeletedItem = null; // for undo deleted item

let dragItem = null;
let dragContent = null;
let dragStartY = 0;
let dragStartTop = 0;
let placeholder = null;

// For scrolling list when reordering
let autoScrollDirection = 0;   // -1 = up, +1 = down, 0 = none
let autoScrollRAF = null;      // requestAnimationFrame id

let longpressTimeout = null;   // check for long press on an item
let longPressed = false;       // flag for whether it is a long or short press
let shortPressHandled = false; // flag for whether a short press has been handled

// Helper functions to get the touch and mouse coordinates
function getClientX(e) {
  if (e.touches && e.touches.length > 0) {
    return e.touches[0].clientX;        // ongoing touch
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    return e.changedTouches[0].clientX; // touch that changed
  } else if (e.clientX !== undefined) {
    return e.clientX;                   // mouse event
  }
  return 0;
}

function getClientY(e) {
  if (e.touches && e.touches.length > 0) {
    return e.touches[0].clientY;        // ongoing touch
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    return e.changedTouches[0].clientY; // touch that changed
  } else if (e.clientY !== undefined) {
    return e.clientY;                   // mouse event
  }
  return 0;
}

/////////////////////////////////////////////////////////////////////////
// Bookmark List - Swipe to delete item stuff

// onSwipeStart
function onSwipeStart(e, songname) {
  // if (!e.target.closest('.swipe-item')) return;  // might need this for the single-click to work.

  swipeContent = swipeItem?.querySelector('.swipe-content');
  swipeStartX = getClientX(e);
  swipeStartY = getClientY(e);
  isHorizontal = null;
  isSwiping = false;
  swipeContent.style.transition = 'none';
  
  longPressed = false;
  
  // check for long press of item
  longpressTimeout = setTimeout(() => {
    // --- LONG PRESS ADD BOOKMARK LOGIC ---
    longPressed = true;
    addBookmarkMenuOverlay.dataset.songname = songname; // pass songname to the addBookmarkMenuOverlay.addEventListener
    addBookmarkMenuOverlay.style.display = "flex";  // show Add Bookmark Menu popup window
    // execution continues with the addBookmarkMenuOverlay.addEventListener click events
  }, 700); // longpress hold time
    
} // end onSwipeStart

// onSwipeMove
function onSwipeMove(e) {
  clearTimeout(longpressTimeout);   // clear longpress timeout
  const currentX = getClientX(e);
  const currentY = getClientY(e);
  const diffX = currentX - swipeStartX;
  const diffY = currentY - swipeStartY;

  // Determine horizontal or vertical swipe direction if not yet decided
  if (isHorizontal === null) {
    if (Math.abs(diffX) > Math.abs(diffY)) {
      isHorizontal = true;   // horizontal swipe → lock vertical scroll
      isSwiping = true;
    } else if (Math.abs(diffX) < Math.abs(diffY)) {
      isHorizontal = false;  // vertical scroll → lock horizontal swipe
    } else {
      return;
    }
  }
  
  if (isHorizontal) {
    e.preventDefault(); // prevent vertical scroll. MUST be before anything else
    // Horizontal swipe allowed (only left since if swiping right diffX is positive and the Math.min will return 0 to not do any translate)
    const translateX = Math.min(0, diffX);
    swipeContent.style.transform = `translateX(${translateX}px)`;
  } else {
    // Vertical scroll allowed → horizontal swipe disabled
    // by not doing the transform = translateX line
    // Do nothing, let browser do vertical scroll
  }
} // end onSwipeMove

// onSwipeEnd   
function onSwipeEnd(e) {
  clearTimeout(longpressTimeout); // stop the longpressTimeout timer
  shortPressHandled = false;
  
  const item = swipeItem;
  const content = swipeContent;
  const currentX = getClientX(e);
  const diffX = currentX - swipeStartX;

  content.style.transition = 'transform 0.2s ease-out';

  if (isHorizontal && diffX < -swipeThreshold) {
    // Only delete if it was a horizontal swipe and greater than the threshold
    content.style.transform = 'translateX(-100%)';

    content.addEventListener('transitionend', function onSlide(ev) {
      if (ev.propertyName !== 'transform') return;
      content.removeEventListener('transitionend', onSlide);

      // Collapse outer <li>, i.e. animate shifting the items up
      item.classList.add('shrinking');
      item.addEventListener('transitionend', function onCollapse(ev2) {
        if (ev2.propertyName !== 'height') return;
        item.removeEventListener('transitionend', onCollapse);
        
        // delete item from local storage
        const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
        const folderItems = bookmarks[currentBookmarkFolder] || [];
        // Find the index of the item to remove
        // We use the dataset index we set in createBookmarkList
        const songNameToRemove = item.dataset.name; // save the song name
        const indexToRemove = parseInt(item.dataset.index); // save the index of song
        if (indexToRemove > -1) {
          folderItems.splice(indexToRemove, 1); // Remove from the array
          bookmarks[currentBookmarkFolder] = folderItems; // Update the folder
          localStorage.setItem(APP_NAME+"_bookmarks", JSON.stringify(bookmarks)); // Save back
        }            
         
        // save the deleted item for undo
        lastDeletedItem = {
          item: item,
          parent: item.parentNode,
          nextSibling: item.nextSibling,
          name: songNameToRemove,
          index: indexToRemove
        };
        
        item.remove();      // remove item from DOM
        createBookmarkList(); // recreate the bookmark list
        showUndoToast(); // show toast for undo
      });
    }, { once: true });

  } else {
    // Snap back if not a horizontal swipe or not far enough
    content.style.transform = 'translateX(0)';
    
    const tapThreshold = 10;
      if (!longPressed && !isSwiping && !isBookmarkListScrolling && Math.abs(diffX) < tapThreshold) {  
      e.preventDefault();   // 🚫 block the synthetic click
      e.stopPropagation();  // 🚫 block bubbling
      if (!shortPressHandled) {
        // item click detected. Display songsheet
        shortPressHandled = true;
        // 1. Retrieve the parameters from the item's dataset
        const songname = swipeItem.dataset.name;  // same as item.dataset.name?
        const songindex = item.dataset.index;

        // 2. Retrieve the folderItems list from localStorage
        const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
        const folderItems = bookmarks[currentBookmarkFolder] || [];

        // 3. Call the selection function
        if (songname && folderItems.length > 0 && !isBookmarkListScrolling) {
          handleBookmarkSelect(songname, songindex, folderItems);
        }
        
      }
    }

  }

  // Reset gesture tracking
  swipeItem = null;
  swipeContent = null;
  isHorizontal = null;
  isSwiping = false;
} // end onSwipeEnd


///// Update swiper with bookmark list pages and display the songsheet when a bookmark item is clicked
function handleBookmarkSelect(songname, songindex, folderItems) {
  stopAudio();
  bookmarkListContainer.style.display = 'none';

  // --- Create the swiper pages for the bookmark folder items
  const folderListPages = [];
  let pageIndex = -1;
  folderItems.forEach((item, index) => {
    // Extract number at the beginning for Numeric List "468 A Child of the King"
    const match = item.match(/^(\d+)/);
    
    if (match) {
      const songNumber = match[1];
      const targetPrefix = songNumber + 'h';  // append "h" for filename
      
      // Search NUMERIC_PAGES for multi pages belonging to this song
      // This regex matches "262h", "262h2", "262h3", etc.
      const regex = new RegExp('^' + targetPrefix + '\\d*$');
      let songPages = NUMERIC_PAGES.filter(p => regex.test(p));
      
      // remove duplicates e.g. His Eye Is On the Sparrow occurs twice in the NUMERIC_PAGES list
      songPages = [...new Set(songPages)];

      // set the actual pageIndex of the selected page in folderListPages
      // this is needed if a song occurs more than once in the bookmark list
      // and the second occurence of the song is selected
      if (index == songindex) {
        pageIndex = folderListPages.length;
      }
      
      // Add all the multi pages for the song to our new swiper list
      folderListPages.push(...songPages);
      
    } else {
      console.warn("handleBookmarkSelect:Regex match failed for bookmark item:", item);
      folderListPages.push(item);
    }
  });
  
  // --- Display the selected song
  currentListPages = folderListPages;
  displaySong(songname, pageIndex);
}


/////////////////////////////////////////////////////////////////////////
// Bookmark List - Drag to reorder item stuff

// for auto scrolling the list when drag item to top or bottom
function autoScrollLoop() {
  if (autoScrollDirection !== 0) {
    const speed = 8; // px per frame, tweak for smoothness
    bookmarkList.scrollTop += autoScrollDirection * speed;
    autoScrollRAF = requestAnimationFrame(autoScrollLoop);
  }
}

// optional for enhance visual smooth slide when dragging
function animateReorder(firstRects) {
  const items = Array.from(bookmarkList.querySelectorAll('.swipe-item'))
                     .filter(el => el !== dragContent && el !== placeholder);

  items.forEach(el => {
    const first = firstRects.get(el);
    if (!first) return;

    const last = el.getBoundingClientRect();
    const dy = first.top - last.top;
    if (!dy) return;

    // Establish the inverted start state without animating…
    const prevTransition = el.style.transition;
    el.style.transition = 'none';
    el.style.transform = `translateY(${dy}px)`;

    // Force a reflow so the browser takes the inverted state as the start frame
    el.offsetHeight; // <- don't remove

    // Restore transition (so transform back to 0 animates), then go to final
    el.style.transition = prevTransition; // '' => use CSS rule with transform 180ms
    el.style.transform = '';
  });
}


let dragStartOffsetHold = 0; 

// onDragStart()
function onDragStart(e) {
  if (e.cancelable) e.preventDefault();
  dragContent = dragItem.closest('.swipe-item');
  if (!dragContent) return;

  const rect = dragContent.getBoundingClientRect();
  
  // 1. Capture where on the item the user grabbed (the offset from the top of the item)
  dragStartOffsetHold = getClientY(e) - rect.top;

  // 2. Placeholder setup
  placeholder = document.createElement('li');
  placeholder.className = 'swipe-item';
  placeholder.style.height = rect.height + 'px';
  dragContent.parentNode.insertBefore(placeholder, dragContent.nextSibling);

  // 3. Move to body
  document.body.appendChild(dragContent);

  // 4. Set fixed positioning to ignore page-level scrolling
  dragContent.style.position = 'fixed';
  dragContent.style.left = rect.left + 'px';
  dragContent.style.top = rect.top + 'px';
  dragContent.style.width = rect.width + 'px';
  dragContent.style.zIndex = '2000';
  dragContent.style.pointerEvents = 'none';
  dragContent.style.transition = 'none';

  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd, { passive: false });
} // end onDragStart()

// onDragMove()
function onDragMove(e) {
  if (!dragContent) return;
  if (e.cancelable) e.preventDefault();

  const clientY = getClientY(e);
  const listRect = bookmarkList.getBoundingClientRect();

  // The top boundary is the top of the bookmarkList. 
  // We don't allow the item's top to go higher than the top of the bookmarkList listRect.top
  let newTop = clientY - dragStartOffsetHold;
  if (newTop < listRect.top) {
      newTop = listRect.top;
  }
  // -----------------------

  dragContent.style.top = newTop + 'px';

  // Autoscroll logic (only scroll when finger is near edges of the list)
  const edgeThreshold = 40;
  if (clientY < listRect.top + edgeThreshold) {
    autoScrollDirection = -1;
  } else if (clientY > listRect.bottom - edgeThreshold) {
    autoScrollDirection = 1;
  } else {
    autoScrollDirection = 0;
  }

  // Only start the auto scroll loop if it isn't already running
  if (autoScrollDirection !== 0 && !autoScrollRAF) {
    autoScrollRAF = requestAnimationFrame(autoScrollLoop);
  } else if (autoScrollDirection === 0 && autoScrollRAF) {
    // Stop the loop if we are no longer at an edge
    cancelAnimationFrame(autoScrollRAF);
    autoScrollRAF = null;
  }

  // Insertion Logic
  const children = Array.from(bookmarkList.querySelectorAll('.swipe-item'))
                        .filter(ch => ch !== dragContent && ch !== placeholder);

  let inserted = false;
  for (const child of children) {
    const r = child.getBoundingClientRect();
    // Use the middle of the child to determine swap point
    if (clientY < r.top + r.height / 2) {
      bookmarkList.insertBefore(placeholder, child);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    bookmarkList.appendChild(placeholder);
  }
} // end onDragMove()


// onDragEnd()
function onDragEnd(e) {
  if (!dragContent) return;

  // Stop autoscroll
  autoScrollDirection = 0;
  if (autoScrollRAF) {
    cancelAnimationFrame(autoScrollRAF);
    autoScrollRAF = null;
  }

  // 1. Physically move the item in the DOM to the placeholder's spot
  bookmarkList.insertBefore(dragContent, placeholder);

  // 2. SAVE THE NEW ORDER TO LOCAL STORAGE
  // We filter to ensure only items with a 'name' dataset are saved
  const listItems = Array.from(bookmarkList.querySelectorAll('.swipe-item'));
  const newOrder = listItems
    .map(li => li.dataset.name)
    .filter(name => name !== undefined && name !== null && name !== "null"); // <-- CRUCIAL FILTER

  // Load current bookmarks
  const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
  
  // Update the current folder
  bookmarks[currentBookmarkFolder] = newOrder;
  
  // Save back to localStorage
  localStorage.setItem(APP_NAME+"_bookmarks", JSON.stringify(bookmarks));

  // 3. Reset styles
  dragContent.style.position = '';
  dragContent.style.left = '';
  dragContent.style.top = '';
  dragContent.style.width = '';
  dragContent.style.zIndex = '';
  dragContent.style.pointerEvents = '';
  dragContent.style.transition = '';

  // 4. Cleanup
  if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  placeholder = null;
  dragContent = null;
  dragItem = null;

  // 5. Refresh the list to clean up DOM and indices
  createBookmarkList();
} // end onDragEnd()

    
/////////////////////////////////////////////////////////////////////////
// Bookmark List - Touch event listeners

// for detecting scrolling of bookmark list
let bookmarkListStartY = 0;
let isBookmarkListScrolling = false;

// Touch start event
bookmarkList.addEventListener('touchstart', (e) => {
  // for detecting scrolling of list
  bookmarkListStartY = e.touches[0].clientY;
  isBookmarkListScrolling = false;
  
  // check for drag on handle
  dragItem = e.target.closest('.drag-handle');
  if (dragItem) {
    if (e.cancelable) e.preventDefault();   // block scroll right away
    e.stopPropagation();
    dragStartY = getClientY(e);
    onDragStart(e); // start drag immediately
    // make sure swipe is NOT initialized for this touch
    swipeItem = null;
    swipeContent = null;
    isHorizontal = null;
    return;
  }
  
  // check for swipe on item
  swipeItem = e.target.closest('.swipe-item');  // this will setup the swipe for the <li> item
  if (swipeItem) {
    const songname = swipeItem.dataset.name;  // get the songname from the list dataset
    onSwipeStart(e, songname);
  }
}, { passive: false }); // end touchstart event

// Touch move event
bookmarkList.addEventListener('touchmove', (e) => {
  // for detecting scrolling of list
  // If we move more than 10px vertically, it's a list scroll
  if (Math.abs(e.touches[0].clientY - bookmarkListStartY) > 10) {
    isBookmarkListScrolling = true;
  }
  
  if (dragContent) {
    if (e.cancelable) e.preventDefault();   // block scroll right away
    onDragMove(e);
    return;
  }
  
  // check for swipe move
  if (swipeContent) {
    onSwipeMove(e);
  }
  
}, { passive: false }); // end touchmove event

// Touch end event
bookmarkList.addEventListener('touchend', (e) => {
  if (dragContent) {
    onDragEnd(e);
    // fully reset swipe state so nothing tries to "delete"
    swipeItem = null;
    swipeContent = null;
    isHorizontal = null;
    return; // ← block swipe end
  }

  if (swipeItem && swipeContent) {  // swipe to delete ok but swipe up will display the song with this line
     onSwipeEnd(e);
  }
}); // end touchend event

bookmarkList.addEventListener('touchcancel', () => {
  clearTimeout(longpressTimeout);
});

/////////////////////////////////////////////////////////////////////////
// Bookmark List - Mouse event listeners
// Mouse down event
bookmarkList.addEventListener('mousedown', (e) => {
  // 1. Check for drag on handle
  dragItem = e.target.closest('.drag-handle');
  if (dragItem) {
    e.preventDefault(); 
    e.stopPropagation();
    dragStartY = getClientY(e);
    onDragStart(e);

    // Attach global listeners so drag continues even if mouse leaves the list
    window.addEventListener('mousemove', onMouseDragMove);
    window.addEventListener('mouseup', onMouseDragEnd);
    return;
  }

  // 2. Check for swipe on item (Desktop swipe simulation)
  swipeItem = e.target.closest('.swipe-item');
  if (swipeItem) {
    const songname = swipeItem.dataset.name;  // get the songname from the list dataset
    onSwipeStart(e, songname);
    window.addEventListener('mousemove', onMouseSwipeMove);
    window.addEventListener('mouseup', onMouseSwipeEnd);
  }
});

// Helper: Global Mouse Drag Move
function onMouseDragMove(e) {
  if (dragContent) {
    onDragMove(e);
  }
}

// Helper: Global Mouse Drag End
function onMouseDragEnd(e) {
  if (dragContent) {
    onDragEnd(e);
  }
  // Clean up global listeners
  window.removeEventListener('mousemove', onMouseDragMove);
  window.removeEventListener('mouseup', onMouseDragEnd);
}

// Helper: Global Mouse Swipe Move
function onMouseSwipeMove(e) {
  if (swipeContent) {
    onSwipeMove(e);
  }
}

// Helper: Global Mouse Swipe End
function onMouseSwipeEnd(e) {
  if (swipeItem && swipeContent) {
    onSwipeEnd(e);
  }
  window.removeEventListener('mousemove', onMouseSwipeMove);
  window.removeEventListener('mouseup', onMouseSwipeEnd);
}

  
/////////////////////////////////////////////////////////////////////////
// Bookmark List - toast for undo delete
let toastTimeout = null;
function showUndoToast() {
  const toast = document.getElementById('undo-toast');
  toast.classList.add('show'); 
  
  // Clear any existing timer to prevent premature hiding
  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    lastDeletedItem = null;
  }, 3000);
}

// Restore item when UNDO button is clicked
document.getElementById('undoBtn').addEventListener('click', (e) => {
  // 1. IMPORTANT: Prevent this click from bubbling up to lists behind the toast
  e.stopPropagation();

  if (lastDeletedItem) {
    // 2. Update Local Storage Data first
    const bookmarks = JSON.parse(localStorage.getItem(APP_NAME+"_bookmarks") || "{}");
    const folderItems = bookmarks[currentBookmarkFolder] || [];
    
    // Insert the name back at the stored index
    folderItems.splice(lastDeletedItem.index, 0, lastDeletedItem.name);
    
    bookmarks[currentBookmarkFolder] = folderItems;
    localStorage.setItem(APP_NAME+"_bookmarks", JSON.stringify(bookmarks));

    // 3. Refresh the UI from the fresh data
    // This is safer than manual DOM insertion as it resets all data-index values correctly
    createBookmarkList();

    lastDeletedItem = null;
  }

  // 4. Hide Toast immediately
  clearTimeout(toastTimeout);
  document.getElementById('undo-toast').classList.remove('show');
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Search stuff
const navIcons = document.getElementById('nav-icons');
const searchBarContainer = document.getElementById('search-bar-container');
const searchInput = document.getElementById('searchInput');
const searchList = document.getElementById('searchList');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  // Hide standard lists when searching
  numericList.style.display = 'none';
  numericListSidebar.style.display = 'none';
  alphabeticList.style.display = 'none';
  alphabeticListSidebar.style.display = 'none';
  strokeList.style.display = 'none';
  strokeListSidebar.style.display = 'none';
  bookmarkListContainer.style.display = 'none';

  if (query === "") {
    searchList.style.display = 'none';
    return;
  }

  // initialize currentListPages and currentListIndex
  const isNumeric = /^\d+$/.test(query);        // a number
  const isAlphabetic = /[a-zA-Z]/.test(query);  // an alphabet
  const isChinese = (/[^a-zA-Z]/.test(query)) && !isNumeric;    // a chinese character
  if (isNumeric) {
    currentListPages = NUMERIC_PAGES;
    currentListIndex = NUMERIC_INDEX;
  } else if (isAlphabetic) {
    currentListPages = ALPHABETIC_PAGES;
    currentListIndex = ALPHABETIC_INDEX;
  } else {
    currentListPages = STROKE_PAGES;
    currentListIndex = STROKE_INDEX;
  }
  const filteredSongs = currentListIndex.filter(title =>
    title.toLowerCase().includes(query)
  );

  renderSearchList(filteredSongs);
});

// Create the search list with the matching songs
function renderSearchList(songs) {
  searchList.innerHTML = '';
  searchList.style.display = 'block';
  
  adjustSearchListHeight(); // Adjust list height whenever results change

  if (songs.length === 0) {
    searchList.innerHTML = '<div style="padding:20px; color:#888; text-align:center;">未找到匹配的歌曲</div>'; // No matching songs found
    return;
  }
  // only one matching song so display it
  if (songs.length === 1) {
    const songname = songs[0];
    closeSearch();
    displaySong(songname, -1); // --- display the song. -1 for songindex means don't use the index
    return;
  }
  
  songs.forEach((songname) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.textContent = songname;

    attachListItemEventHandler(item, songname); // attached the touch and mouse event handlers for this song
    
    searchList.appendChild(item);         // add item to list
  });
} // end renderSearchList


function closeSearch() {
  searchInput.value = ''; // Clear search
  searchBarContainer.style.display = 'none';
  searchList.style.display = 'none';
  navIcons.style.display = 'flex';
}

// to adjust the searchList height to accomodate the soft keyboard that pops up
function adjustSearchListHeight() {
  if (searchList.style.display === 'none') return;

  // Use the Visual Viewport API to get the actual visible height
  const vv = window.visualViewport;
  const menuHeight = 60; // Your #menu-bar height
  
  // Calculate the distance from the top of the menu to the top of the keyboard
  // vv.height is the height of the area NOT covered by the keyboard
  // vv.offsetTop handles cases where the page might have zoomed
  const availableHeight = vv.height - (vv.offsetTop + menuHeight);

  searchList.style.height = `${availableHeight}px`;
}

// Listen for viewport changes (keyboard appearing/disappearing)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', adjustSearchListHeight);
  window.visualViewport.addEventListener('scroll', adjustSearchListHeight);
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Music Player stuff
const audio = document.getElementById("audio");
const playBtn = document.getElementById("btnPlay");
const pauseBtn = document.getElementById("btnPause");
const stopBtn = document.getElementById("btnStop");
const progressBar = document.getElementById("progressBar");
const elapsedTime = document.getElementById("elapsed");
const remainingTime = document.getElementById("remaining");
const audioFilenameDiv = document.getElementById("audioFilename");

let audiofileAvailable = false;
let playing = false;

// Format time from seconds to MM:SS
function formatTime(seconds) {
  seconds = Math.floor(seconds);
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Update time display and progress bar
function updateTimeDisplay() {
  if (audio.duration) {
    elapsedTime.textContent = formatTime(audio.currentTime);
    remainingTime.textContent = formatTime(audio.duration - audio.currentTime);
    progressBar.max = audio.duration;
    progressBar.value = audio.currentTime;
  } else {
    elapsedTime.textContent = "0:00";
    remainingTime.textContent = "0:00";
    progressBar.max = 100;
    progressBar.value = 0;
  }
}

// Display the Music Player popup
function openMusicPlayer() {
  document.getElementById('musicPlayerOverlay').classList.add('show');
  
  // get filename
  let filename = currentListPages[swiper.activeIndex];
  // remove the page number from the end of the name, e.g. the 2 from Serenade - Liszt2
  filename = filename.replace(/(2|3|4)$/, '');
  
  if (!playing) {
    audio.src = "audios/"+filename+".mp3"; // Set the audio source when popup opens
    audio.load(); // Ensure the audio is ready for playback

    // Disable the controls initially
    playBtn.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    progressBar.disabled = true;
    
    // Check if the file exists (after loading data)
    audio.onloadeddata = () => {
      const songname = pages2Index(filename);   // convert *_PAGES format "468h" to NUMERIC_INDEX format "468 A Child of the King"
      audioFilenameDiv.textContent = songname;  // Display the song name
      updateTimeDisplay();  // Show the initial time remaining
      playBtn.disabled = false;
    };

    // If the file can't be loaded, show error
    audio.onerror = () => {
      audioFilenameDiv.textContent = "沒有音訊檔案";  // No audio file
    };

  }
}


function closeMusicPlayer() {
  document.getElementById('musicPlayerOverlay').classList.remove('show');
}

// Detect Esc key to close the Music Player popup
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMusicPlayer();
});

function playAudio() {
  audio.play();
  playBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  progressBar.disabled = false;
  playing = true;
}

function pauseAudio() {
  audio.pause();
  playBtn.disabled = false;
  pauseBtn.disabled = true;
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  progressBar.disabled = true;
  updateTimeDisplay();
  playing = false;
}
/*
audio.addEventListener("loadeddata", () => {
  audiofileAvailable = true;
});

audio.addEventListener("loadedmetadata", () => {
  if (musicPlayerIsOpen && audiofileAvailable) {
    updateTimeDisplay();
  }
});

audio.addEventListener("error", () => {
  console.warn("Audio file not found or cannot be loaded.");
  audiofileAvailable = false;
});
*/


audio.addEventListener("timeupdate", () => {
  updateTimeDisplay();
});

progressBar.addEventListener("input", () => {
  audio.currentTime = progressBar.value;
});

// triggers when song has ended
audio.addEventListener("ended", () => {
  stopAudio();
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Toast message at bottom stuff
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000); // hide after 3s
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Regular expression. Regex:
//    ^     beginning of string
//    $     end of string
//    +     one or more
//    *     zero or more
//    .     any single character
//    ^     not
//    \d    a digit
//    \d+   one or more digits
//    \s    a space
//    .*    everything
//    [^\s] or [^ ] not a space
//    [a-zA-Z]+   // one or more letters

//////////////////////////////////////////////////////////////////////////////////
//// Helper function to convert *_PAGES format "468h" to NUMERIC_INDEX format "468 A Child of the King"
function pages2Index(page) {
  const match = page.match(/^(\d+)/); // extract the number 486h
  const songnumber = match[1];
  const songname = NUMERIC_INDEX.find(title => title.startsWith(songnumber + " "));
  return songname;
}


//////////////////////////////////////////////////////////////////////////////////
//// Helper function to convert the name string to "310 A Child of the King AH468"
//// from either "A Child of the King 310 AH468" or "310 A Child of the King AH468"
function formatName(name) {
  // 1. Find the first occurrence of digits
  const match = name.match(/\d+/);
  
  if (!match) return name; // Return original if no number found

  const songNumber = match[0];
  
  // 2. Split the string by that number to get "before" and "after" parts
  const parts = name.split(songNumber);
  
  // 3. Clean the text parts (trim whitespace)
  const beforeText = parts[0].trim();
  const afterText = parts[1].trim();

  // 4. Join the text parts together with a single space
  // We filter out empty strings in case the number was at the very start
  const combinedText = [beforeText, afterText].filter(Boolean).join(' ');

  // 5. Construct final format: Number + Space + Combined Text
  return `${songNumber} ${combinedText}`;
}


//////////////////////////////////////////////////////////////////////////////////
//// Helper function to attach the touch and mouse event handlers for given song
// Called by NUMERIC_INDEX.forEach and ALPHABETIC_INDEX.forEach, and renderSearchList
function attachListItemEventHandler(item, songname) {
  // --- touch and mouse event handlers ---
  let longpressTimer = null;
  let isLongPress = false;
  let isScrolling = false;
  let startX = 0;
  let startY = 0;

  const startPress = (e) => {
    // Record starting position to check for movement "slop"
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    
    isLongPress = false;
    isScrolling = false;
    e.stopPropagation();

    longpressTimer = setTimeout(() => {
      // --- LONG PRESS ADD BOOKMARK LOGIC ---
      isLongPress = true;
      addBookmarkMenuOverlay.dataset.songname = songname; // pass songname to the addBookmarkMenuOverlay.addEventListener
      addBookmarkMenuOverlay.style.display = "flex";  // show Add Bookmark Menu popup window
      // execution continues with the addBookmarkMenuOverlay.addEventListener click events
    }, 700); // longpress hold time
  };

  const endPress = (e) => {
    clearTimeout(longpressTimer);
    if (!isLongPress && !isScrolling) {
      // --- CLICK DISPLAY SONG LOGIC ---
      stopAudio();
      closeSearch();
      numericList.style.display = 'none';
      numericListSidebar.style.display = 'none';
      alphabeticList.style.display = 'none'; 
      alphabeticListSidebar.style.display = 'none';
      strokeList.style.display = 'none'; 
      strokeListSidebar.style.display = 'none';
      displaySong(songname, -1); // --- display the song
    }
    isLongPress = false;
    isScrolling = false;
  };

  const moveHandler = (e) => {
    if (!longpressTimer && !isScrolling) return;
    
    // Check if the finger moved more than 10px (the "slop")
    const touch = e.touches ? e.touches[0] : e;
    const moveX = Math.abs(touch.clientX - startX);
    const moveY = Math.abs(touch.clientY - startY);
    
    // If we move more than 10px, it's a scroll/swipe, not a tap
    if (moveX > 10 || moveY > 10) {
      isScrolling = true; // Mark as scrolling
      clearTimeout(longpressTimer);
      longpressTimer = null;
    }
  };

  const cancelPress = () => {
    clearTimeout(longpressTimer);
    longpressTimer = null;
    isLongPress = false;
    isScrolling = false;
  };

  // --- bindings ---
  item.addEventListener('contextmenu', (e) => e.preventDefault());

  // Touch
  // use passive: false to disable system from handling the touches
  // We will handle the touches in startPress and endPress
  item.addEventListener('touchstart', startPress, { passive: false });
  item.addEventListener('touchend', endPress, { passive: false });
  item.addEventListener('touchmove', moveHandler, { passive: false });
  item.addEventListener('touchcancel', cancelPress, { passive: false });

  // Mouse
  item.addEventListener('mousedown', startPress);
  item.addEventListener('mouseup', endPress);
  item.addEventListener('mouseleave', cancelPress);  
}

       
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Wake Lock to prevent device from going to sleep
let wakeLock = null;

const requestWakeLock = async () => {
  try {
    // Request a screen wake lock
    wakeLock = await navigator.wakeLock.request('screen');
    
    // Listen for the release event
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock was released');
    });
    console.log('Wake Lock is active');
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Service Worker stuff
// This is the UI to notify user of new updates
function revealUpdateMenuItem() {
  const updateItem = document.getElementById('updateMenuItem');
  if (updateItem) {
    updateItem.style.display = 'flex'; // Use flex to match your other items
    console.log("SW 4:Notify user of new updates");
  }
}

let newWorker;

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("sw.js");  // register the service worker
      console.log("SW 0:Service Worker registered with scope:", reg.scope);

      // If there's a service worker already waiting then notify user of a new update
      if (reg.waiting) {
        console.log("SW :waiting");
        newWorker = reg.waiting;
        revealUpdateMenuItem();
      }

      // If there's a new service worker update found then notify user of a new update
      reg.addEventListener('updatefound', () => {
        console.log("SW 2:New updates found");
        newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log("SW 3:New updates downloaded and ready to install");
            revealUpdateMenuItem();
          }
        }); // end addEventListener statechange        
      }); // end addEventListener updatefound
      
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    } // end catch

    // refresh index.html after SW updated
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      console.log("SW 6:App updated - refreshing page");
      // the time delay is only for debugging to see the console log
      setTimeout(adjustSearchListHeight, 3000);  
      window.location.reload();
      refreshing = true;
    });

    } // end if ('serviceWorker' in navigator)
}

registerServiceWorker();  // start the Service Worker

// Check for service worker updates every so often
setInterval(() => {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) {
      console.log("SW 1:Checking for service worker updates");
      reg.update();  // step 1
    }
  });
//}, 6 * 60 * 60 * 1000); // 6 * 60 * 60 * 1000 every 6 hours
}, 15 * 1000); // every 15 seconds