let gulp=require('gulp');
let webserver=require('gulp-webserver');
gulp.task('webserver',function(){
  let options={
    port:8787, /*自定义端口*/
    livereload:true,/*实现自动刷新，从此不再需要手动刷新页面了*/
    open:true, /*服务器启动时自动打开网页*/
    fallback:'index.html'
  };
  gulp.src('.')
      .pipe(webserver(options))
});
