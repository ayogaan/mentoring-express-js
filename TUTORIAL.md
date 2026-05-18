# Sequelize Relationships Tutorial: Category, Tag, and Product

This tutorial covers how to implement and use **One-to-Many** and **Many-to-Many** relationships using Sequelize in a Node.js application.

---

## 1. One-to-Many Relationship: Category & Product

A **Category** can have many **Products**, but each **Product** belongs to only one **Category**.

### Model Definition: `Category`
In `models/category.js`, we define the `hasMany` association.
```javascript
static associate(models) {
  Category.hasMany(models.Product, {
    foreignKey: "category_id",
    as: "products",
  });
}
```

### Model Definition: `Product`
In `models/product.js`, we define the inverse `belongsTo` association.
```javascript
static associate(models) {
  Product.belongsTo(models.Category, {
    foreignKey: "category_id",
    as: "category",
  });
}
```

---

## 2. Many-to-Many Relationship: Product & Tag

A **Product** can have multiple **Tags** (e.g., "Sale", "New Arrival"), and a **Tag** can be associated with multiple **Products**. This requires a junction table: `ProductTag`.

### Junction Model: `ProductTag`
In `models/producttag.js`, this table stores the IDs of both related models.
```javascript
ProductTag.init({
  id_product: DataTypes.INTEGER,
  id_tag: DataTypes.INTEGER
}, { ... });
```

### Associations in `Product` and `Tag`
Both models use `belongsToMany` and point to the `through` table.

**In `Product`:**
```javascript
this.belongsToMany(models.Tag, { 
  through: models.ProductTag,
  foreignKey: 'id_product',
  otherKey: 'id_tag'
});
```

**In `Tag`:**
```javascript
this.belongsToMany(models.Product, {
  through: models.ProductTag,
  foreignKey: 'id_tag',
  otherKey: 'id_product'
});
```

---

## 3. Using Relationships in the Controller

Once associations are defined, you can use **Eager Loading** (the `include` option) to fetch related data in one query.

### Fetching Products with Category and Tags
In `controllers/products.controller.js`, the `getAllProducts` function retrieves a product along with its category and tags.

```javascript
const products = await Product.findAll({
    where: { ...oprator },
    include: [
        {
            model: Category,
            as: "category", // Matches the alias in Product model
        },
        {
            model: Tag,
            // Tags will be included via the ProductTag junction table
        },
    ],
});
```

### Reverse Lookup: Categories with Products
You can also start from the Category to see all products under it:

```javascript
const productPerCategory = async (req, res) => {
    const data = await Category.findAll({
        include: [
            {
                model: Product,
                as: "products"
            }
        ]
    });
    res.json(data);
}
```

---

## Summary of Relationships
| Relation Type | Models | Association Method | Key Parameter |
| :--- | :--- | :--- | :--- |
| **One-to-Many** | Category -> Product | `hasMany` / `belongsTo` | `category_id` |
| **Many-to-Many** | Product <-> Tag | `belongsToMany` | `through: ProductTag` |
