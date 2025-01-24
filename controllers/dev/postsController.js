const fs = require('fs');

dataPath = `${__dirname}/../dev-data/data/posts.json`;
const posts = JSON.parse(fs.readFileSync(dataPath));

exports.checkId = (req, res, next, val) => {
  if (req.params.id > posts.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  next();
};

exports.getAllPosts = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
};

exports.getPost = (req, res) => {
  const id = req.params.id * 1;

  const post = posts.find((el) => {
    return el.id === id;
  });

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
};

exports.createPost = (req, res) => {
  NewId = posts[posts.length - 1].id + 1;
  NewPost = Object.assign({ id: NewId }, req.body);
  posts.push(NewPost);
  fs.writeFile(dataPath, JSON.stringify(posts), (err) => {});
  res.status(201).json({
    status: 'success',
    results: posts.length,
    data: {
      post: NewPost,
    },
  });
};

exports.updatePost = (req, res) => {
  const id = req.params.id * 1;

  const index = posts.findIndex((el) => {
    return el.id === id;
  });

  const post = posts[index];
  const updatePost = Object.assign(post, req.body);
  posts[index] = updatePost;
  fs.writeFile(dataPath, JSON.stringify(posts), (err) => {});

  res.status(200).json({
    status: 'success',
    data: {
      post: updatePost,
    },
  });
};

exports.deletePost = (req, res) => {
  const id = req.params.id * 1;

  const index = posts.findIndex((el) => {
    return el.id === id;
  });

  posts.splice(index, 1);
  fs.writeFile(dataPath, JSON.stringify(posts), (err) => {});

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
