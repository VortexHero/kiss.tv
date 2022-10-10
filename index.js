let data = [
  [
    'Ludwig',
    'Austin',
    'https://clips.twitch.tv/SaltyZealousPastaSpicyBoy-QXmiElv_WTF8Y8yO',
  ],
  ['Ludwig', 'xQc', 'https://www.youtube.com/watch?v=Nz_8KDHROmA'],
  ['Ludwig', 'Karl', 'https://www.youtube.com/watch?v=5c2AXjgSzPU'],
  ['Ludwig', 'Hasan', 'https://www.youtube.com/shorts/BBIibFIwbno'],
  ['Ludwig', 'Slime', 'https://www.youtube.com/watch?v=MFurDxxqP-A'],
  ['Ludwig', 'Rich', 'https://www.youtube.com/watch?v=W_WLeLMdoOA'],
  ['Austin', 'xQc', 'https://www.youtube.com/watch?v=YZ_394HQiic'],
  ['Austin', 'Karl', 'https://www.youtube.com/watch?v=MLQlR3fOxJM'],
  ['Austin', 'QT', 'https://www.youtube.com/watch?v=Pir6nXaUMbM'],
  ['Austin', 'Ted', 'https://www.youtube.com/watch?v=o2_6abppodU'],
  ['Austin', 'Schlatt', 'https://www.youtube.com/watch?v=HLAdmL4WOAc'],
  ['Austin', 'Rich', 'https://www.youtube.com/watch?v=AtIJEHwRArQ'],
  ['Karl', 'Hasan', 'https://www.youtube.com/watch?v=V-qxssdbjGk'],
  ['Hasan', 'Will', 'https://www.youtube.com/watch?v=rtMc65YQsEc'],
  ['Rich', 'Cyr', null],
];

let adjList = {};

for (let i = 0; i < data.length; i++) {
  let [from, to, url] = data[i];
  if (!adjList[from]) {
    adjList[from] = [];
  }
  if (!adjList[to]) {
    adjList[to] = [];
  }
  adjList[from].push([to, url]);
  adjList[to].push([from, url]);
}

let names = new Set();

data.forEach((element) => {
  names.add(element[0]);
  names.add(element[1]);
});

$('#name1').autocomplete({
  source: [...names],
});

$('#name2').autocomplete({
  source: [...names],
});

if (!(onMobile() && navigator.share) && navigator.clipboard) {
  document.getElementById('shareButton').innerText = 'Copy Link';
} else {
  document.getElementById('shareButton').classList.add('d-none');
}

document.getElementById('inputForm').addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('inputFormSubmitButton').disabled = true;

  let name1 = document.getElementById('name1').value;
  let name2 = document.getElementById('name2').value;

  document.getElementById('name1').value = '';
  document.getElementById('name2').value = '';

  if (!name1 || !name2) {
    alert('Please enter two names.');
    document.getElementById('inputFormSubmitButton').disabled = false;
    return;
  }

  if (name1 === name2) {
    alert('Please enter two different names.');
    document.getElementById('inputFormSubmitButton').disabled = false;
    return;
  }

  if (!adjList[name1] || !adjList[name2]) {
    alert('One or both of the names you entered are not in the database.');
    document.getElementById('inputFormSubmitButton').disabled = false;
    return;
  }

  let output;

  let queue = [{ node: name1, path: [] }];
  let visited = new Set();
  while (queue.length > 0) {
    let { node, path } = queue.shift();
    if (node === name2) {
      output = path;
      break;
    }
    if (visited.has(node)) {
      continue;
    }
    visited.add(node);
    for (let [to, url] of adjList[node]) {
      queue.push({ node: to, path: [...path, [node, url]] });
    }
  }

  document.getElementById('outputContent').innerHTML = '';
  if (!output) {
    let h2 = document.createElement('h2');
    h2.innerText = 'No path found.';
    document.getElementById('outputContent').appendChild(h2);
  } else {
    let h2 = document.createElement('h2');
    h2.innerText = `${name1} to ${name2} has a kiss number of ${output.length}!`;
    document.getElementById('outputContent').appendChild(h2);

    for (let [from, url] of output) {
      let h3 = document.createElement('h3');
      h3.innerText = from;
      document.getElementById('outputContent').appendChild(h3);
      if (url) {
        let button = document.createElement('button');
        let img = document.createElement('img');
        img.src = '/arrowplay.png';
        img.height = 50;
        img.width = 50;
        button.type = 'button';
        button.classList.add('plain-btn');
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#videoModal');
        button.setAttribute('data-bs-url', url);
        button.appendChild(img);
        document.getElementById('outputContent').appendChild(button);
      } else {
        let a = document.createElement('a');
        let img = document.createElement('img');
        img.src = '/arrow.png';
        img.height = 50;
        img.width = 50;
        document.getElementById('outputContent').appendChild(img);
      }
    }

    let h3 = document.createElement('h3');
    h3.innerText = name2;
    document.getElementById('outputContent').appendChild(h3);
  }

  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('name1', name1);
  urlParams.set('name2', name2);
  window.history.pushState({}, '', '?' + urlParams);

  document.getElementById('input').classList.add('d-none');
  document.getElementById('output').classList.remove('d-none');
  document.getElementById('inputFormSubmitButton').disabled = false;
});

document.getElementById('newButton').addEventListener('click', (event) => {
  document.getElementById('name1').value = '';
  document.getElementById('name2').value = '';
  document.getElementById('outputContent').innerHTML = '';

  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete('name1');
  urlParams.delete('name2');
  window.history.pushState({}, '', '?' + urlParams);

  document.getElementById('inputFormSubmitButton').disabled = false;
  document.getElementById('output').classList.add('d-none');
  document.getElementById('input').classList.remove('d-none');
});

document.getElementById('shareButton').addEventListener('click', (event) => {
  let url = window.location.href;

  if (onMobile() && navigator.share) {
    navigator.share({
      url: url,
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  }
});

const videoModal = document.getElementById('videoModal');
videoModal.addEventListener('show.bs.modal', (event) => {
  const button = event.relatedTarget;
  const url = button.getAttribute('data-bs-url');

  let urlObject = new URL(url);
  if (urlObject.hostname === 'clips.twitch.tv') {
    let videoId = urlObject.pathname.split('/').pop();
    document.getElementById(
      'videoModalBody'
    ).innerHTML = `<iframe class="w-100" height="262" src="https://clips.twitch.tv/embed?clip=${videoId}&parent=${
      window.location.host.split(':')[0]
    }" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>
    `;
  }

  if (urlObject.hostname === 'www.youtube.com') {
    let videoId = urlObject.searchParams.get('v');
    if (!videoId) {
      videoId = urlObject.pathname.split('/').pop();
    }
    document.getElementById(
      'videoModalBody'
    ).innerHTML = `<iframe class="w-100" height="262" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'`;
  }
});

videoModal.addEventListener('hidden.bs.modal', (event) => {
  document.getElementById('videoModalBody').innerHTML = '';
});

function onMobile() {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}
