const express = require('express');
const Contest = require('../models/contest');
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET contests listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {summary: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const contests = await Contest.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('contests/index', {contests: contests, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('contests/new', {contest: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  res.render('contests/edit', {contest: contest});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).populate('author');
  const answers = await Answer.find({contest: contest.id}).populate('author');
  contest.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  
  await contest.save();
  res.render('contests/show', {contest: contest, answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }
  contest.title = req.body.title;
  contest.summary = req.body.summary ;
  contest.objects = req.body.objects;
  contest.phone = req.body.phone;
  contest.categori = req.body.categori;
  contest.organizer = req.body.organizer;
  contest.tags = req.body.tags.split(" ").map(e => e.trim());

  await contest.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/contests');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Contest.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/contests');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var contest = new Contest({
    title: req.body.title,
    author: user._id,
    summary: req.body.summary,
    objects: req.body.objects,
    phone: req.body.phone,
    categori: req.body.categori,
    organizer: req.body.organizer,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await contest.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/contests');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    contest: contest._id,
    content: req.body.content
  });
  await answer.save();
  contest.numAnswers++;
  await contest.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/contests/${req.params.id}`);
}));



module.exports = router;
