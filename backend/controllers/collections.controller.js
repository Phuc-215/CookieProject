const service = require('../services/collections.service');

exports.list = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const collections = await service.getUserCollections(
      targetUserId, 
      currentUserId,
      { page, limit }
    );

    res.json({
      success: true,
      data: collections
    });

  } catch (error) {
    console.error("List Collections Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    if (isNaN(collectionId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const { page, limit } = req.query;
    const currentUserId = req.user.id;

    const collection = await service.getCollectionDetails(
      collectionId, 
      currentUserId, 
      { page, limit }
    );

    if (!collection) {
      return res.status(404).json({ success: false, message: "Cookie jar not found" });
    }

    res.json({ success: true, data: collection });

  } catch (error) {
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error("Get Collection Detail Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.create = async (req, res) => {
  try {
    const newCollection = await service.createCollection({
      userId: req.user.id, 
      title: req.body.title,
      description: req.body.description,
      isPrivate: req.body.isPrivate
    });

    // 3. Response
    res.status(201).json({
      success: true,
      message: "Cookie Jar created successfully",
      data: newCollection
    });

  } catch (err) {
    console.error("Create Collection Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.addToCollection = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    if (isNaN(collectionId)) {
      return res.status(400).json({ success: false, message: "Invalid Collection ID" });
    }

    // 3. Call Service
    const result = await service.addRecipeToCollection(
      req.user.id, 
      collectionId, 
      req.body.recipeId
    );

    // 4. Response
    const message = result.isNew 
      ? "Recipe added to jar" 
      : "Recipe is already in this jar";

    res.json({ success: true, message });

  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    // Handle Foreign Key violation (if Recipe ID doesn't exist in recipes table)
    if (error.code === '23503') {
       return res.status(404).json({ success: false, message: "Recipe does not exist" });
    }
    
    console.error("Add Recipe Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};