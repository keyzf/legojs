import homeView from './view/home';
import listView from './view/list';
import listData from './data/list';

HBY.components('home', homeView);
HBY.router({
    '/home' () {
        console.warn('ppppppppppppppppp');
        HBY.create(listView, {
            dataSource: {
                api: ['test', 'ok'],
                server: listData
            },
            onAfter(self) {
                let i = 0;
                HBY.setTimer('theTime', setInterval(() => {
                    self.options.data[0].last = i;
                    self.refresh();
                    i++;
                }, 3000));
            },
            components: [{
                el: '#test',
                dataSource: {
                    api: ['ok'],
                    server: listData
                },
                // data: {
                //     list: [
                //         { first: 'home3', last: 'Bond3' },
                //         { first: 'test3', last: 'bbbb3' }
                //     ]
                // }
            }]
        });
    },
    '/home/list' () {
        HBY.create(listView, {
            data: {
                list: [
                    { first: 'home', last: 'Bond' },
                    { first: 'test', last: 'bbbb' }
                ]
            },
            components: [{
                el: '#home',
                data: [
                    { first: 'home2', last: 'Bond2' },
                    { first: 'test2', last: 'bbbb2' }
                ]
            }, {
                el: '#test',
                data: [
                    { first: 'home3', last: 'Bond3' },
                    { first: 'test3', last: 'bbbb3' }
                ]
            }]
        });
    },
    '/home/detail/:id' (id) {
        console.warn('pppppppppp');
    }
});
