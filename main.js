const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play')
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist')
const app = {
    isplaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    currentIndex: 0,
    songs: [
        {
            name: 'Cưới đi',
            single: '2T, ChangC',
            path: './assets/music/CuoiDi.mp3',
            image: './assets/image/anh1.jpg'
        },
        {
            name: 'Răng khôn',
            single: 'Phí Phương Anh, RIN9',
            path: './assets/music/RangKhon.mp3',
            image: './assets/image/anh2.jpg'
        },
        {
            name: 'Chỉ muốn bên em lúc này',
            single: 'Jiki X, Huy Vạc',
            path: './assets/music/ChiMuonBenEmLucNay.mp3',
            image: './assets/image/anh3.jpg'
        },
        {
            name: 'Sài gòn đau lòng quá',
            single: 'Hứa Kim Tuyền, Hoàng Duyên',
            path: './assets/music/SaiGonDauLongQua.mp3',
            image: './assets/image/anh4.jpg'
        },
        {
            name: 'Tình yêu màu hồng',
            single: 'Hồ Văn Quý, Xám',
            path: './assets/music/TinhYeuMauHong.mp3',
            image: './assets/image/anh5.jpg'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    // hàm render các bài hát ra website
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index= "${index}">
                    <div class="thumb"
                    style="background-image: url('${song.image}');">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.single}</p>
                </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    // lấy ra bài hát đầu tiên
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    // Xử lý các sự kiện
    hendleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // xử lý CD quay / dùng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || console.log(document.documentElement.scrollTop);
            const newcdWidth = cdWidth - scrollTop;
            cd.style.width = newcdWidth + 'px'; 
            // 0 ? newcdWidth + 'px' : 0
            cd.style.opacity = newcdWidth / cdWidth;
        }
        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isplaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        // khi song được play
        audio.onplay = function () {
            _this.isplaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // khi song pause
        audio.onpause = function () {
            _this.isplaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // xử lý khi tua
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // xử lý bật tắt khi random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        // xử lý lặp lại 1 song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
           if (songNode || e.target.closest('.option')) {
                // xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.getAttribute('data-index'));
                    _this.render();
                    _this.loadCurrentSong();
                    audio.play();
                }
                // xử lý khi click vào song option

           }
        }
    },
    // thực hiện cuộn lên tên song khi next or prev
    scrollToActiveSong: function () {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        })
    },
    // Tải thông tin bài hát đầu tiên vào UI (Giao diện) khi chạy ứng dụng
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    // Hàm khởi chạy
    start: function () {
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();
        // Lắng nghe/  xử lý các sự kiện (DOM event)
        this.hendleEvent();
        // Tải thông tin bài hát đầu tiên vào UI (Giao diện) khi chạy ứng dụng
        this.loadCurrentSong();
        // Render playlist
        this.render();
        // hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', _this.isRandom);
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }
}
app.start();
