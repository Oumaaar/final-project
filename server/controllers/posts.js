import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
	try {
		const postMessages = await PostMessage.find();

		res.status(200).json(postMessages);
	} catch (error) {
		res.status(404).json({ message: error });
	}
};

export const createPost = async (req, res) => {
	const post = req.body;

	const newPostMessage = new PostMessage({
		...post,
		creator: req.userId,
		createdAt: new Date().toISOString(),
	});

	newPostMessage
		.save()
		.then((result) => {
			return res.status(201).json(newPostMessage);
		})
		.catch((error) => {
			return res.status(409).json({ message: error });
		});
};

export const updatePost = async (req, res) => {
	const { id: _id } = req.params;
	const { title, message, selectedFile, creator, tags } = req.body;

	if (!mongoose.Types.ObjectId.isValid(_id))
		return res.status(404).send("No post with that id");

	try {
		const updatePost = await PostMessage.findByIdAndUpdate(
			_id,
			{
				title,
				message,
				selectedFile: selectedFile,
				creator,
				tags,
				_id,
			},
			{
				new: true,
			}
		);

		return res.status(200).json(updatePost);
	} catch (error) {
		return res.status(409).json({ message: error });
	}
};

export const deletePost = async (req, res) => {
	const { id: _id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(_id))
		return res.status(404).send("No post with that id");

	await PostMessage.findByIdAndRemove(_id);

	res.json({ message: "Post deleted successfully" });
};

export const likePost = async (req, res) => {
	const { id: _id } = req.params;

	if (!req.userId) return res.json({ message: "Unauthenticated" });

	if (!mongoose.Types.ObjectId.isValid(_id))
		return res.status(404).send("No post with that id");

	const post = await PostMessage.findById(_id);

	const index = post.likes.findIndex((id) => id === String(req.userId));

	if (index === -1) {
		post.likes.push(req.userId);
	} else {
		post.likes = post.likes.filter((id) => id !== String(req.userId));
	}

	const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
		new: true,
	});

	res.json(updatedPost);
};