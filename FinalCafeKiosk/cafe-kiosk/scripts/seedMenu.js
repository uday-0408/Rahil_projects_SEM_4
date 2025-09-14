const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MenuItem = require("../models/MenuItem");

dotenv.config();

// Your complete menu data
const menuData = {
  HotCoffee: [
    { name: "Americano", price: 150, img: "/Images/HotCoffee/Americano.jpg", desc: "Espresso diluted with hot water for a rich, bold flavor.", calories: 15 },
    { name: "Dark Roast", price: 175, img: "/Images/HotCoffee/PremiumCoffee.jpg", desc: "Intense and robust dark roast coffee, perfect for a morning boost.", calories: 20 },
    { name: "Cappuccino", price: 160, img: "/Images/HotCoffee/Cappuccino.jpg", desc: "Steamed milk foam layered over a shot of espresso.", calories: 80 },
    { name: "Caramel Cappuccino", price: 175, img: "/Images/HotCoffee/CaramelCappuccino.jpg", desc: "A cappuccino topped with a sweet caramel drizzle.", calories: 90 },
    { name: "Vanilla Cappuccino", price: 175, img: "/Images/HotCoffee/VanillaCappuccino.jpg", desc: "Cappuccino infused with a hint of vanilla for extra smoothness.", calories: 85 },
    { name: "French Vanilla Latte", price: 190, img: "/Images/HotCoffee/FrenchVanilla.jpg", desc: "A velvety latte with a subtle French vanilla flavor.", calories: 110 },
    { name: "Classic Roast Latte", price: 160, img: "/Images/HotCoffee/Latte.jpg", desc: "A balanced latte with classic roasted coffee flavor.", calories: 100 },
    { name: "Caramel Macchiato", price: 190, img: "/Images/HotCoffee/CaramelMacchiato.jpg", desc: "Layered espresso with milk foam and caramel, creating a sweet contrast.", calories: 120 },
    { name: "Classic Mocha Latte", price: 210, img: "/Images/HotCoffee/Mocha.jpg", desc: "A delightful blend of espresso, chocolate, and steamed milk.", calories: 130 }
  ],
  ColdCoffee: [
    { name: "Classic Iced Coffee", price: 200, img: "/Images/ColdCoffee/IcedCoffee.jpg", desc: "A refreshing iced coffee served over ice.", calories: 80 },
    { name: "Iced Caramel Coffee", price: 220, img: "/Images/ColdCoffee/IcedCaramelCoffee.jpg", desc: "Iced coffee with a sweet caramel infusion.", calories: 90 },
    { name: "Caramel Frappe", price: 250, img: "/Images/ColdCoffee/CaramelFrappe.jpg", desc: "A blended frappe with rich caramel flavor.", calories: 150 },
    { name: "Iced Macchiato", price: 220, img: "/Images/ColdCoffee/IcedCaramelMacchiato.jpg", desc: "Layered iced espresso with a touch of milk.", calories: 100 },
    { name: "Classic Iced Mocha", price: 220, img: "/Images/ColdCoffee/IcedMocha.jpg", desc: "Iced mocha with a perfect blend of chocolate and coffee.", calories: 110 },
    { name: "Iced Mocha Frappe", price: 250, img: "/Images/ColdCoffee/MochaFrappe.jpg", desc: "A creamy blended mocha frappe served chilled.", calories: 140 },
    { name: "French Vanilla Latte", price: 220, img: "/Images/ColdCoffee/IcedFrenchVanillaLatte.jpg", desc: "Chilled latte enhanced with French vanilla essence.", calories: 120 }
  ],
  Snacks: [
    { name: "Classic Stuffed Bagel", price: 200, img: "/Images/Snacks/Bagel.png", desc: "A freshly baked bagel stuffed with herbed cream cheese.", calories: 300 },
    { name: "Veg Cheese Burger", price: 220, img: "/Images/Snacks/cheeseBurger.jpeg", desc: "A hearty veggie burger topped with melted cheese.", calories: 350 },
    { name: "Cheese Chili Toast", price: 250, img: "/Images/Snacks/CheeseToast.png", desc: "Toasted bread topped with spicy cheese and chili.", calories: 250 },
    { name: "Deluxe Cheese Burger", price: 250, img: "/Images/Snacks/DeluxBurger.jpeg", desc: "A gourmet burger loaded with cheese, veggies, and a special sauce.", calories: 450 },
    { name: "Spicy Snack Wrap", price: 220, img: "/Images/Snacks/SnackWrap.jpg", desc: "topped with shredded cheese and shredded lettuce", calories: 380 },
    { name: "Classic Pan Cakes", price: 175, img: "/Images/Snacks/Hotcakes.jpeg", desc: "Light and fluffy pancakes served with maple syrup.", calories: 400 }
  ],
  Desserts: [
    { name: "Classic Vanilla Shake", price: 175, img: "/Images/Desserts/VanillaShake.jpg", desc: "A smooth vanilla shake made with real vanilla beans.", calories: 350 },
    { name: "Chocolate Shake", price: 180, img: "/Images/Desserts/ChocolateShake.jpg", desc: "A rich, creamy chocolate shake for dessert lovers.", calories: 370 },
    { name: "Premium Hot Chocolate", price: 220, img: "/Images/Desserts/HotChocolate.jpg", desc: "Decadent hot chocolate topped with whipped cream.", calories: 420 },
    { name: "Hot Fudge Sundae", price: 175, img: "/Images/Desserts/HotFudgeSundae.jpg", desc: "An ice cream sundae drizzled with warm hot fudge.", calories: 500 },
    { name: "SoftServe Cone", price: 120, img: "/Images/Desserts/VanillaCone.jpg", desc: "Classic soft serve ice cream in a crispy cone.", calories: 300 },
    { name: "M&M SoftServe", price: 175, img: "/Images/Desserts/MandMSoftServe.jpg", desc: "Soft serve ice cream mixed with crunchy M&M's.", calories: 320 },
    { name: "OREO SoftServe", price: 175, img: "/Images/Desserts/OREOSoftServe.jpg", desc: "Soft serve blended with crushed Oreos.", calories: 310 },
    { name: "ChocolateChip Cookie", price: 120, img: "/Images/Desserts/ChocolateChipCookie.jpg", desc: "A freshly baked cookie loaded with chocolate chips.", calories: 220 },
    { name: "Baked ApplePie", price: 110, img: "/Images/Desserts/BakedApplePie.jpg", desc: "A warm apple pie with a flaky crust and spiced filling.", calories: 280 },
    { name: "Classic Cheese Cake", price: 230, img: "/Images/Desserts/Cheesecake.png", desc: "Rich and creamy cheesecake with a graham cracker crust.", calories: 450 },
    { name: "Chocolate Donut", price: 220, img: "/Images/Desserts/ChocolateDonut.png", desc: "A soft, glazed chocolate donut.", calories: 350 }
  ]
};
const flatItems = [];

for (const category in menuData) {
  for (const item of menuData[category]) {
    flatItems.push({
      name: item.name,
      desc: item.desc,
      price: item.price,
      image: item.img,
      calories: Number(item.calories),
      category: category.replace(/([A-Z])/g, ' $1').trim() // "HotCoffee" → "Hot Coffee"
    });
  }
}

async function seedMenu() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cafe-kiosk");
    console.log("✅ Connected to MongoDB");

    await MenuItem.deleteMany({});
    console.log("Cleared existing menu items");

    await MenuItem.insertMany(flatItems);
    console.log("✅ Menu items seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding menu:", error);
    process.exit(1);
  }
}

seedMenu();