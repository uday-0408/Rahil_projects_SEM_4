const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest orders
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    dineType: {
      type: String,
      enum: ["Dine-In", "Takeaway"],
      default: "Dine-In",
    },
    subtotal: Number,
    tax: Number,
    usedPoints: {
      type: Number,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
    },
    total: Number,
    status: {
      type: String,
      enum: ["Preparing", "Ready", "Completed"],
      default: "Preparing",
    },
    isGuestOrder: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Auto-delete guest orders after 1 hour when completed
OrderSchema.post("findOneAndUpdate", async (doc) => {
  if (doc && doc.isGuestOrder && doc.status === "Completed") {
    setTimeout(
      async () => {
        try {
          await mongoose.model("Order").findByIdAndDelete(doc._id)
          console.log(`Guest order ${doc.orderNumber} deleted`)
        } catch (error) {
          console.error("Error deleting guest order:", error)
        }
      },
      60 * 60 * 1000,
    ) // 1 hour
  }
})

module.exports = mongoose.model("Order", OrderSchema)
