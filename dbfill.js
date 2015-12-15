'use strict';

var db = require('./lib/db.js');

db
  .table('groups')
  .run()
  .then(function (groups) {
    groups.forEach(function (group) {
      var msgs = [];
      for(var i=0; i<1000; i++) {
        var msg = {
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis odio vitae convallis posuere. Vivamus dignissim neque non felis suscipit hendrerit. Integer dictum, purus sed egestas sodales, neque ante vulputate ex, eget luctus augue tellus at nisi. In consectetur, dolor ut fermentum vestibulum, ligula libero lobortis risus, ac euismod mi diam ut urna. Duis dignissim ipsum eu nisi condimentum, in pretium metus varius. Morbi vel sodales dui, ut pulvinar massa. Nullam eget justo sit amet sem lacinia feugiat a vel nisl. Vivamus vitae neque gravida, varius diam et, pulvinar turpis. Ut sit amet arcu imperdiet nulla dignissim mattis non quis enim. Aliquam at arcu odio. Donec porttitor pellentesque sapien, et accumsan purus elementum et. Praesent id commodo nisl. In et nisi leo. Nullam auctor accumsan rhoncus. Vestibulum arcu odio, sodales a urna ac, malesuada faucibus orci. Morbi sit amet erat sapien.Nam accumsan, odio et cursus accumsan, velit mauris volutpat urna, non semper velit ligula vel quam. Nunc lorem mi, placerat vel consectetur non, tempor at augue. Suspendisse pretium dolor sed vehicula tempor. Etiam eget finibus nulla. Aenean lacinia varius fermentum. Donec ullamcorper facilisis eleifend. Curabitur hendrerit velit id velit commodo, viverra molestie metus sodales.Sed varius dignissim urna, et semper libero lacinia et. Aliquam ut ornare risus, at porta ex. Duis sit amet nibh dignissim, luctus risus nec, cursus urna. Aenean condimentum ipsum sed quam iaculis blandit. Nunc tincidunt, justo in sodales facilisis, orci nunc rhoncus massa, sed faucibus velit massa vel dolor. Suspendisse nec dignissim quam, eget bibendum.',
          groupId: group.id,
          seenBy: {},
          url: null,
          user: {
            id: '078fb800-962d-4921-b9a0-364883161bd3',
            name: 'Trevor Hanus'
          },
          createdAt: Date.now()
        };
        msgs.push(msg);
      }
      db.table('messages').insert(msgs).run().then(function () { console.log('Inserted'); });
    });
  });
