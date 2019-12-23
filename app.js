function httpReq(){
  return {
    get(url,cb){
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener('load', ()=>{
          if (Math.floor(xhr.status/100)!==2){
            cb(`Error. Status of error${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null,response);
        });

        xhr.addEventListener("error", ()=>{
          cb(`Error. Status of error${xhr.status}`, xhr);
        });
        xhr.send();
      } catch (error) {
        cb(error)
      }
    },
    post(url, body, headers, cb){
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener('load', ()=>{
          if (Math.floor(xhr.status/100)!==2){
            cb(`Error. Status of error${xhr.status}`);
            return;
          };
          const response = JSON.parse(xhr.responseText);
          cb(null,response)
        });
        xhr.addEventListener("error", ()=>{
          cb(`Error. Status of error${xhr.status}`);
        });

        if (headers){
          Object.entries(headers).forEach(([key, value])=>{
            xhr.setRequestHeader(key,value);
          })
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error)
      }
    }
  }
};


const http=httpReq();


//check funk
// http.post("https://jsonplaceholder.typicode.com/posts",
// {
//   title: "foo",
//   body:"Loremdfg dgdfg dgd dfg dfg hj",
//   userId:1,
// },
// {
//   'Content-type':"application/json; charset=UTF-8"
// },
// (err, res)=>{
//   console.log(err,res);
// });

//init http module
const newsServise =(function(){
  const apiKey="0deaf1c43ebe45fba13047c94829f57c";
  const apiUrl="https://newsapi.org/v2"

  return {
    topHedlines(country="ru", category="", cb){
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,cb);
    },
    everything(query, category="", cb){
      http.get(`${apiUrl}/everything?q=${query}&category=${category}&apiKey=${apiKey}`,cb);
    },
  }
})();

//Elements
const form = document.forms.newsControls;
const selectCounry = form.elements['country'];
const searchInput=form.elements['search'];
const categoryInput=form.elements['category'];

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  loadNews();
})

//load function

function loadNews(){
  showPreloader();
  const country=selectCounry.value;
  const searchText=searchInput.value;
  const category=categoryInput.value;


  if (!searchText){
    newsServise.topHedlines(country, category, onGetResponse);}
  else {
    newsServise.everything(searchText,category, onGetResponse);
  }

};

//function on get response from server
function onGetResponse(err, res){
  removeLoader();
  if(err){
    showMsg(err, 'error-msg');
    return;
  }
   if (res.articles.length==0){  // в запросе ввести всякую ерунду
    alert("НИЧЕГО НЕ НАЙДЕНО");
  }
  console.log(res);
  renderNews(res.articles);
}

//function renderNews

function renderNews(news){
  const newsContainer=document.querySelector(".news-container .row");
  if (newsContainer.children.length){
    clearContainer(newsContainer);
  }

  let fragment="";

news.forEach(newsItem=>{
  const el=newsTemplate(newsItem);
  fragment+=el;
});
newsContainer.insertAdjacentHTML("afterbegin",fragment);
}


//news template function
function newsTemplate({urlToImage,url, title, description}) {
  return `
  <div class="col s10">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}" alt="#">
          <span class="card-title">${title || ""}</span>
        </div>
        <div class="card-content">
          <p>${description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
  </div>
  `;
}


//show message (used for error now)
function showMsg(msg, type="success"){
  M.toast({html: msg, classes:type})
}


//clear Container
function clearContainer(container){
  // container.innerHTML=""
  let child=container.lastElementChild;
  while(child){
    container.removeChild(child);
    child=container.lastElementChild;
  }
}

//preloader
function showPreloader(){
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="progress">
      <div class="indeterminate"></div>
  </div>
  `);
};

//removeLoaderFunc

function removeLoader(){
  const loader=document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}



//init select to M
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});
