const express = require('express')
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { User, Song, Album, Comment } = require('../../db/models');
const router = express.Router();

//edit comment
router.put('/:commentId', restoreUser, requireAuth, async (req, res)=>{
  const {commentId} = req.params
  const {user} = req
  const {body} = req.body
  const comment = await Comment.findByPk(commentId)
  if(comment&&comment.userId===user.id){
    comment.body = body
    await comment.save()
    return res.json(comment)
  }
  if(!comment){
    res.statusCode = 404
    res.json({
      message: 'Comment couldn\'t be found',
      statusCode: res.statusCode,
    })
  }
  if (comment.userId!==user.id){
    res.statusCode = 401
    res.json({
      statusCode: res.statusCode,
      message: 'Unauthorized'
    })
  }
})
//create comment for song via songId
router.post('/:songId/comments', async (req, res)=>{
  const {songId} = req.params
  const {user} = req
  const {body} = req.body
  const song = await Song.findByPk(songId)
  const comment = await Song.createComment({
    userId: user.id,
    body
  })
  if (!song) {
    res.statusCode = 404
    res.json({
      message: 'Song couldn\'t be found',
      statusCode: res.statusCode,
    })
  }
  res.json(comment)
})
//coments by song id
router.get('/:songId/comments', async(req, res)=>{
  const {songId} = req.params
  const song = await Song.findByPk(songId)
  const comments = await song.getComments({
    include:[{model:User, attributes:['id', 'username']}]
  })
  if (!song) {
    res.statusCode = 404
    res.json({
      message: 'Song couldn\'t be found',
      statusCode: res.statusCode,
    })
  }
  res.json({Comments:comments})
})

module.exports = router;
