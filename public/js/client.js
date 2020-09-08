function toRub(price){
  return new Intl.NumberFormat('ru-Ru', {
    currency: 'rub',
    style: 'currency'
  }).format(price);
}

document.querySelectorAll('.price').forEach(item => {
  item.textContent = toRub(item.textContent);
});

const $card = document.querySelector('#card');
if($card){
  $card.addEventListener('click', event => {
    if(event.target.classList.contains('js-remove')){
      const id = event.target.dataset.id;
      const csrf = event.target.dataset.csrf;

      fetch('/card/remove/' + id, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf
        }
      }).then(res => res.json())
        .then(card => {
          console.log(card);
          if (card.courses.length){
            const html = card.courses.map(item => {
              return `<tr>
              <td>${item.courseId.title}</td>
              <td>${item.count}</td>
              <td><button class="btn btn-small js-remove" data-id="${item.courseId._id}">Remove</button></td>
            </tr>`;
            }).join(''); //приводим массив к строке

            $card.querySelector('tbody').innerHTML = html;
            $card.querySelector('.price').textContent = toRub(card.price);
          } else {
            $card.innerHTML = '<h4>Card is empty</h4>';
          }
        });
    }
  });
}

const toDate = date => {
  return new Intl.DateTimeFormat('ru-RU',{
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
}

document.querySelectorAll('.date').forEach(item => {
  item.textContent = toDate(item.textContent);
});

//Инициализация табов (materialize)
let instance = M.Tabs.init(document.querySelectorAll('.tabs'));