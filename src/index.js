import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
  exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
  limit: config.bodyLimit
}));

// connect to db
initializeDb(db => {
  let todos = [{
    id: 4,
    text: 'Some todo item',
    done: false,
    dateAdded: new Date(2018, 2, 2).toISOString()
  }, {
    id: 3,
    text: 'Another todo item',
    done: false,
    dateAdded: new Date(2018, 2, 1).toISOString()
  }, {
    id: 2,
    text: 'This should be done',
    done: true,
    dateAdded: new Date(2018, 1, 29).toISOString()
  }, {
    id: 1,
    text: 'Do the dishes',
    done: true,
    dateAdded: new Date(2018, 1, 29).toISOString()
  }];

  // internal middleware
  app.use(middleware({config, db}));

  // api router
  app.use('/api', api({config, db}));

  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });

  // GET /todos
  app.get('/todos', (req, res) => res.json(todos));

  // POST /todos
  app.post('/todos', (req, res) => {
    const todo = Object.assign(req.body);
    todo.id = todos.length + 1;
    todos = [todo, ...todos];
    res.json(todo);
  });

  // PUT /todos/:id
  app.put('/todos/:id', (req, res) => {
    let currentIndex = -1;
    for (const [index, todo] of todos.entries()) {
      if (todo.id === parseInt(req.params.id)) currentIndex = index;
    }
    if (currentIndex >= 0) todos[currentIndex] = req.body;
    res.json(req.body);
  });
});

export default app;
