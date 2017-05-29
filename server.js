var http = require('http')
var fs = require('fs')
var url = require('url')

//console.log(Object.keys(http))
var port = process.env.PORT || 8888;

var server = http.createServer(function(request, response){

  var temp = url.parse(request.url, true)
  var path = temp.pathname
  var query = temp.query
  var method = request.method

  //从这里开始看，上面不要看

  if(path === '/'){  // 如果用户请求的是 / 路径
    var string = fs.readFileSync('./index.html')  
    response.setHeader('Content-Type', 'text/html;charset=utf-8')  
    response.end(string)   
  }else if(path === '/signUp' && method === 'POST'){
    getPostData(request, function(postData){

      let errors = checkPostData(postData)
      if(Object.keys(errors).length === 0){
        let {email, password} = postData
        let user = {
          email: email,
          passwordHash: frankHash(password) // 永远不要使用 MDN5，永远不要自己发明加密算法
        }
        // 写数据库
        let dbString = fs.readFileSync('./db.json', 'utf-8')  
        let dbObject = JSON.parse(dbString)
        dbObject.users.push(user)
        let dbString2 = JSON.stringify(dbObject)
        fs.writeFileSync('./db.json',dbString2, {encoding: 'utf-8'})  
      }else{
        response.statusCode = 400
      }
      response.setHeader('Content-Type', 'text/html;charset=utf-8') 
      response.end(JSON.stringify(errors)) // 运行在node.js
    })
  }else if(path === '/node_modules/jquery/dist/jquery.min.js'){
    let string = fs.readFileSync('./node_modules/jquery/dist/jquery.min.js')  
    response.setHeader('Content-Type', 'application/javascript;charset=utf-8')  
    response.end(string)   
  }else if(path === '/main.js'){
    let string = fs.readFileSync('./main.js')  
    response.setHeader('Content-Type', 'application/javascript;charset=utf-8')  
    response.end(string)   
  }else if(path === '/home'){
    var cookies = parseCookies(request.headers.cookie);
    response.setHeader('Content-Type', 'text/html;charset=utf-8')  
    if(cookies.logined === 'true'){
      response.end(`${cookies.user_id}已登录`)   
    }else{
      let string = fs.readFileSync('./home')  
      response.end(string)   
    }
  }else if(path === '/login' && method === 'POST'){
    // 读数据库
    getPostData(request, (postData)=>{
      let dbString = fs.readFileSync('./db.json', 'utf-8')  
      let dbObject = JSON.parse(dbString)
      let users = dbObject.users

      let {email, password} = postData
      let found 
      for( var i=0; i< users.length; i++){
        if(users[i].email === email && users[i].passwordHash === frankHash(password)){
          found = users[i]
          break
        }
      }
      if(found){
        // 标记该用户登录了 
        response.setHeader('Set-Cookie', ['logined=true; expires=1000; path=/;', 'user_id='+email+'; expires=123456789; path=/;'])
        response.end('')
      }else{
        response.statusCode = 400
        let errors = {email: '没有注册或密码错误'} 
        response.setHeader('Content-Type', 'text/html;charset=utf-8') 
        response.end(JSON.stringify(errors))   
      }
    })
  }else if(path === "/page1.json"){
      let string = fs.readFileSync("./page1.json");
      response.setHeader("content-type","application/json");
      response.end(string);

  }else if(path === "/page2.json"){
      let string = fs.readFileSync("./page2.json");
      response.setHeader("content-type","application/json");
      response.end(string);}
  else if(path === "/page3.json"){
      let string = fs.readFileSync("./page3.json");
      response.setHeader("content-type","application/json");
      response.end(string);}
  else if(path === "/page4.json"){
      let string = fs.readFileSync("./page4.json");
      response.setHeader("content-type","application/json");
      response.end(string);}
  else if(path === "/page5.json"){
      let string = fs.readFileSync("./page5.json");
      response.setHeader("content-type","application/json");
      response.end(string);}
  else{
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8') 
    response.end('找不到对应的路径，你需要自行修改 index.js')
  }

  // 代码结束，下面不要看
  console.log(method + ' ' + request.url)
})

function getPostData(request, callback){
    data = ''
    request.on('data', (postData) => {
      data += postData.toString()
    })

    request.on('end', () => {
      let array = data.split('&')
      let postData = {}
      for(var i=0; i<array.length; i++){
        let parts = array[i].split('=')
        let key = decodeURIComponent(parts[0])
        let value = decodeURIComponent(parts[1])
        postData[key] = value
      }
      callback.call(null, postData)
    })
}

function checkPostData(postData){
  let {email, password, password_confirmation} = postData
  let errors = {}
  // check email
  if(email.indexOf('@') <= 0){
    errors.email = '邮箱不合法'
  }
  if(password.length < 6){
    errors.password = '密码太短'
  }

  if(password_confirmation !== password){
    errors.password_confirmation = '两次输入密码不匹配'
  }

  return errors
}

function frankHash(string){
  return 'frank' + string + 'frank'
}

function parseCookies(cookie) { // JSON.parse
  try{
    return cookie.split(';').reduce(
      function(prev, curr) {
        var m = / *([^=]+)=(.*)/.exec(curr);
        var key = m[1];
        var value = decodeURIComponent(m[2]);
        prev[key] = value;
        return prev;
      },
      { }
    );
  }catch(error){
    return {}
  }
}

function stringifyCookies(cookies) { //JSON.stringify
  var list = [ ];
  for (var key in cookies) {
    list.push(key + '=' + encodeURIComponent(cookies[key]));
  }
  return list.join('; ');
}

server.listen(port)
console.log('监听 ' + port + ' 成功，请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
