docute.init({
    landing: './music/landing.html',
    nav: {
    },
    plugins: [
        docsearch({
            apiKey: '',
            indexName: 'aplayer',
            tags: ['english', 'zh-Hans'],
            url: 'https://aplayer.js.org'
        }),
        evanyou(),
        player()
    ]
});

function player () {
    return function (context) {
        context.event.on('landing:updated', function () {
            console.log('landing:updated');
            clearPlayer();
            aplayer0();
            aplayer1();
        });
        context.event.on('content:updated', function () {
            console.log('content:updated');
            clearPlayer();
            for (let i = 0; i < document.querySelectorAll('.load').length; i++) {
                document.querySelectorAll('.load')[i].addEventListener('click', function () {
                    window[this.parentElement.id] && window[this.parentElement.id]();
                });
            }
        });
    };
}

function clearPlayer () {
    for (let i = 0; i < 10; i++) {
        if (window['ap' + i]) {
            window['ap' + i].destroy();
        }
    }
}

function aplayer1 () {
    window.ap1 = new APlayer({
        container: document.getElementById('aplayer1'),
        theme: '#F57F17',
        lrcType: 3,
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            lrc: '歌词1',
            theme: '#ebd0c2'
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
            lrc: '歌词2',
            theme: '#46718b'
        }, {
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
            lrc: '歌词3',
            theme: '#505d6b'
        }]
    });
}

function aplayer0 () {
    window.ap0 = new APlayer({
        container: document.getElementById('aplayer0'),
        fixed: true,
        lrcType: 3,
        audio: [{
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
            lrc: '歌词3',
            theme: '#505d6b'
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
            lrc: '歌词2',
            theme: '#46718b'
        }, {
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            lrc: '歌词1',
            theme: '#ebd0c2'
        }]
    });
}

function aplayer2 () {
    window.ap2 = new APlayer({
        container: document.getElementById('aplayer2'),
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            theme: '#ebd0c2'
        }]
    });
}

function aplayer3 () {
    window.ap3 = new APlayer({
        container: document.getElementById('aplayer3'),
        mini: false,
        autoplay: false,
        loop: 'all',
        order: 'random',
        preload: 'auto',
        volume: 0.7,
        mutex: true,
        listFolded: false,
        listMaxHeight: 90,
        lrcType: 3,
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            lrc: '歌词1',
            theme: '#ebd0c2'
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
            lrc: '歌词2',
            theme: '#46718b'
        }, {
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
            lrc: '歌词3',
            theme: '#505d6b'
        }]
    });
}

function aplayer4 () {
    window.ap4 = new APlayer({
        container: document.getElementById('aplayer4'),
        lrcType: 3,
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            lrc: '歌词1',
            theme: '#ebd0c2'
        }]
    });
}

function aplayer5 () {
    window.ap5 = new APlayer({
        container: document.getElementById('aplayer5'),
        lrcType: 3,
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            lrc: '歌词1',
            theme: '#ebd0c2'
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
            lrc: '歌词2',
            theme: '#46718b'
        }, {
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
            lrc: '歌词3',
            theme: '#505d6b'
        }]
    });
}

function aplayer6 () {
    window.ap6 = new APlayer({
        container: document.getElementById('aplayer6'),
        mini: true,
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            theme: '#ebd0c2'
        }]
    });
}

function aplayer7 () {
    window.ap7 = new APlayer({
        container: document.getElementById('aplayer7'),
        audio: [{
            name: '歌名1(HLS)',
            artist: '歌手1',
            url: '歌曲1串流',
            cover: '封面1',
            theme: '#ebd0c2',
            type: 'hls'
        }, {
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            theme: '#ebd0c2'
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
            theme: '#46718b'
        }, {
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
            theme: '#505d6b'
        }]
    });
}

function aplayer8 () {
    window.ap8 = new APlayer({
        container: document.getElementById('aplayer8'),
        theme: '#e9e9e9',
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
        }, {
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
        }]
    });

    const colorThief = new ColorThief();
    window.ap8.on('switchaudio', function (index) {
        if (!window.ap8.options.audio[index].theme) {
            colorThief.getColorAsync(window.ap8.options.audio[index].cover, function (color) {
                window.ap8.theme(`rgb(${color[0]}, ${color[1]}, ${color[2]})`, index);
            });
        }
    });
}

function aplayer9 () {
    window.ap9 = new APlayer({
        container: document.getElementById('aplayer9'),
        fixed: true,
        lrcType: 3,
        audio: [{
            name: '歌名1',
            artist: '歌手1',
            url: '歌曲1',
            cover: '封面1',
            lrc: '歌词1',
            theme: '#ebd0c2'
        }, {
            name: '歌名2',
            artist: '歌手2',
            url: '歌曲2',
            cover: '封面2',
            lrc: '歌词2',
            theme: '#46718b'
        }, {
            name: '歌名3',
            artist: '歌手3',
            url: '歌曲3',
            cover: '封面3',
            lrc: '歌词3',
            theme: '#505d6b'
        }]
    });
}