const { Product, Category, Tag } = require('../models');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
    try {
        const {search, start, end} = req.query;        
        let oprator = {};
        if(search) {
            oprator.name = {
                [Op.like]: `%${search}%`
            }
        }
        if(start && end) {
            oprator.createdAt = {
                [Op.between]: [new Date(start), new Date(end)]
            }
        }
        console.log(oprator);
        const products = await Product.findAll({
            where: {
                ...oprator
            },
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["name"]

                },
                {
                    model: Tag,
                    as: "tags",
                    attributes: [],
                    
                },
            ],

        });
        res.json(products);
    }catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching products' });
    }
}

const createProduct = async (req, res) => {
    const { name, price, id_category } = req.body;
    try {
        const product = await Product.create({ name, price, id_category });
        product.dataValues.createdBy = req.user;
        console.log("product : ", product);
        res.status(201).json(product);
    }catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while creating the product' });
    }
}

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the product' });
    }
}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    try {
        const product = await Product.findByPk(id);
        if (product) {
            await product.update({ name, price });
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the product' });
    }

}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id);
        if (product) {
            await product.destroy();
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the product' });
    }
}

const updatePrice = async (req, res) => {
    const { id } = req.params;
    const { price } = req.body;
    try {
        const product = await Product.findByPk(id);
        if (product) {
            await product.update({ price });
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the product price' });
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    updatePrice
}