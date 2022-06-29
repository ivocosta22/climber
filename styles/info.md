Inside this folder, there's 2 types of Styles I'm using.

Inside the global.js file, I'm using React's StyleSheet package to create my styles to use globally across the app.

However, I'm also using 'styled', a 3rd party library that I can use to program styles using css, which could be usefull sometimes
It was very usefull for my Cards for example (./components/PostCard).
One downside of this was that I had to create a duplicate style in case I wanted to handle my dark mode, which is not the case with React's StyleSheet,
where I can just set an array of styles Ex: style={[globalstyles.Container, {backgroundColor: '#fff'}]}

This cannot be done using styled at the time of testing.

Files using styled: AddPost.js | CommentsStyles.js | FeedStyles.js | MessageStyles.js

Files using React's StyleSheet: global.js