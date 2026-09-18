using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; } = null!;
        public DbSet<WhatsAppLog> WhatsAppLogs { get; set; } = null!;
        public DbSet<PaymentSetting> PaymentSettings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 0. PaymentSetting Entity
            modelBuilder.Entity<PaymentSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UpiId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.UpiQrCodeUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CallNumber).IsRequired().HasMaxLength(50);
            });

            // 0. WhatsAppLog Entity
            modelBuilder.Entity<WhatsAppLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.OrderId, e.TemplateName });
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.TemplateName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            });

            // 1. User Entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.MobileNumber).HasMaxLength(20);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            });

            // 2. Category Entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.CategoryId);
                entity.HasIndex(e => e.CategoryName).IsUnique();
                entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(100);
            });

            // 3. Product Entity (No FK constraint on CategoryId)
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.ProductId);
                entity.HasIndex(e => e.ProductCode).IsUnique();
                entity.Property(e => e.ProductCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ProductName).IsRequired().HasMaxLength(150);
            });

            // 4. Customer Entity
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.CustomerId);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.MobileNumber).IsRequired().HasMaxLength(20);
            });

            // 5. Order Entity (No FK constraint on CustomerId)
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.OrderId);
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.OrderStatus).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(50);
            });

            // 6. OrderItem Entity (FK constraints on OrderId and ProductId)
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.OrderItemId);
                entity.HasOne(d => d.Order)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(d => d.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Product)
                    .WithMany()
                    .HasForeignKey(d => d.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // 7. OrderStatusHistory Entity (No FK constraint on OrderId)
            modelBuilder.Entity<OrderStatusHistory>(entity =>
            {
                entity.HasKey(e => e.OrderStatusHistoryId);
                entity.Property(e => e.NewStatus).IsRequired().HasMaxLength(50);
            });

            // -------------------------------------------------------------
            // SEED SAMPLE DATA
            // -------------------------------------------------------------
            var createdDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var today = DateTime.UtcNow.Date;

            // Seed Admin User
            var hasher = new PasswordHasher<User>();
            var adminUser = new User
            {
                UserId = 1,
                Email = "karthickkumar2014000@gmail.com",
                MobileNumber = "9443028771",
                Role = "Admin",
                IsActive = true,
                CreatedDate = createdDate
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Vinayaga@2010");
            modelBuilder.Entity<User>().HasData(adminUser);

            // Seed Payment Settings
            modelBuilder.Entity<PaymentSetting>().HasData(
                new PaymentSetting
                {
                    Id = 1,
                    UpiId = "9952378965@upi",
                    UpiQrCodeUrl = "/assets/images/upi-qr.png",
                    CallNumber = "+91 6380891094",
                    UpdatedAt = createdDate
                }
            );

            // Seed 8 Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { CategoryId = 1, CategoryName = "Sparklers", Description = "Electric & Colour Sparklers", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 2, CategoryName = "Ground Chakkars", Description = "Spinning Wheels & Whistling Chakkars", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 3, CategoryName = "Flower Pots", Description = "Golden & Silver Fountains", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 4, CategoryName = "Aerial Shots", Description = "Multi-shot Fancy Sky Aerial Cakes", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 5, CategoryName = "Rockets", Description = "Sky Rockets & Lunik Bombs", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 6, CategoryName = "Kids Novelty", Description = "Pop-Pop, Flash Guns & Cartoons", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 7, CategoryName = "Sound Crackers", Description = "Bijili, Atom Bombs & Garland Crackers", IsActive = true, CreatedDate = createdDate },
                new Category { CategoryId = 8, CategoryName = "Gift Boxes", Description = "Diwali Family Assorted Gift Packs", IsActive = true, CreatedDate = createdDate }
            );

            // Seed Sample Products
            modelBuilder.Entity<Product>().HasData(
                new Product { ProductId = 1, ProductCode = "1", ProductName = "10cm Electric Sparklers", CategoryId = 1, MRPPrice = 160.00m, DiscountPercentage = 55.00m, DiscountPrice = 72.00m, Price = 72.00m, TotalQuantity = 50, Unit = "1 Box (10 Pcs)", ImageUrl = "/assets/images/kambi-sparklers.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 2, ProductCode = "2", ProductName = "15cm Green Sparklers", CategoryId = 1, MRPPrice = 300.00m, DiscountPercentage = 55.00m, DiscountPrice = 135.00m, Price = 135.00m, TotalQuantity = 40, Unit = "1 Box (10 Pcs)", ImageUrl = "/assets/images/electric-sparklers.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 3, ProductCode = "3", ProductName = "30cm Crackling Sparklers", CategoryId = 1, MRPPrice = 600.00m, DiscountPercentage = 55.00m, DiscountPrice = 270.00m, Price = 270.00m, TotalQuantity = 30, Unit = "1 Box (5 Pcs)", ImageUrl = "/assets/images/kambi-sparklers.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 4, ProductCode = "4", ProductName = "Ground Chakkar Special", CategoryId = 2, MRPPrice = 450.00m, DiscountPercentage = 55.00m, DiscountPrice = 202.50m, Price = 202.50m, TotalQuantity = 60, Unit = "1 Box (10 Pcs)", ImageUrl = "/assets/images/ashoka-chakkar.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 5, ProductCode = "5", ProductName = "Chakkar Deluxe Whistling", CategoryId = 2, MRPPrice = 776.00m, DiscountPercentage = 55.00m, DiscountPrice = 349.20m, Price = 349.20m, TotalQuantity = 25, Unit = "1 Box (5 Pcs)", ImageUrl = "/assets/images/ashoka-chakkar.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 6, ProductCode = "6", ProductName = "Flower Pot Special", CategoryId = 3, MRPPrice = 550.00m, DiscountPercentage = 55.00m, DiscountPrice = 247.50m, Price = 247.50m, TotalQuantity = 45, Unit = "1 Box (10 Pcs)", ImageUrl = "/assets/images/peacock-flowerpot.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 7, ProductCode = "7", ProductName = "Golden Fountain Mega", CategoryId = 3, MRPPrice = 1125.00m, DiscountPercentage = 55.00m, DiscountPrice = 506.25m, Price = 506.25m, TotalQuantity = 15, Unit = "1 Box (2 Pcs)", ImageUrl = "/assets/images/golden-fountain.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 8, ProductCode = "8", ProductName = "Thunder King 10-Shot Cake", CategoryId = 4, MRPPrice = 3625.00m, DiscountPercentage = 55.00m, DiscountPrice = 1631.25m, Price = 1631.25m, TotalQuantity = 20, Unit = "1 Piece", ImageUrl = "/assets/images/thunder-king.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 9, ProductCode = "9", ProductName = "30-Shot Multi Color Aerial", CategoryId = 4, MRPPrice = 7000.00m, DiscountPercentage = 55.00m, DiscountPrice = 3150.00m, Price = 3150.00m, TotalQuantity = 10, Unit = "1 Piece", ImageUrl = "/assets/images/colour-smoke-aerial.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 10, ProductCode = "10", ProductName = "Sky Rocket Deluxe", CategoryId = 5, MRPPrice = 725.00m, DiscountPercentage = 55.00m, DiscountPrice = 326.25m, Price = 326.25m, TotalQuantity = 35, Unit = "1 Box (10 Pcs)", ImageUrl = "/assets/images/sky-rocket.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 11, ProductCode = "11", ProductName = "Whistling Rocket Express", CategoryId = 5, MRPPrice = 1050.00m, DiscountPercentage = 55.00m, DiscountPrice = 472.50m, Price = 472.50m, TotalQuantity = 0, Unit = "1 Box (5 Pcs)", ImageUrl = "/assets/images/sky-rocket.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 12, ProductCode = "12", ProductName = "Cartoon Flash Gun", CategoryId = 6, MRPPrice = 375.00m, DiscountPercentage = 55.00m, DiscountPrice = 168.75m, Price = 168.75m, TotalQuantity = 50, Unit = "1 Piece", ImageUrl = "/assets/images/kids-novelty.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 13, ProductCode = "13", ProductName = "Bijili Crackers Strips", CategoryId = 7, MRPPrice = 237.50m, DiscountPercentage = 55.00m, DiscountPrice = 106.88m, Price = 106.88m, TotalQuantity = 80, Unit = "1 Bag (100 Pcs)", ImageUrl = "/assets/images/bijili-deluxe.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 14, ProductCode = "14", ProductName = "Hydrogen Atom Bomb", CategoryId = 7, MRPPrice = 600.00m, DiscountPercentage = 55.00m, DiscountPrice = 270.00m, Price = 270.00m, TotalQuantity = 40, Unit = "1 Box (10 Pcs)", ImageUrl = "/assets/images/atom-bomb.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 15, ProductCode = "15", ProductName = "Zumba Dance", CategoryId = 8, MRPPrice = 524.44m, DiscountPercentage = 55.00m, DiscountPrice = 236.00m, Price = 236.00m, TotalQuantity = 60, Unit = "1 Box (12 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 16, ProductCode = "16", ProductName = "Super Star", CategoryId = 8, MRPPrice = 711.11m, DiscountPercentage = 55.00m, DiscountPrice = 320.00m, Price = 320.00m, TotalQuantity = 45, Unit = "1 Box (18 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 17, ProductCode = "17", ProductName = "Peacock Dance-UV", CategoryId = 8, MRPPrice = 877.78m, DiscountPercentage = 55.00m, DiscountPrice = 395.00m, Price = 395.00m, TotalQuantity = 38, Unit = "1 Box (21 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 18, ProductCode = "18", ProductName = "Samba Party", CategoryId = 8, MRPPrice = 1044.44m, DiscountPercentage = 55.00m, DiscountPrice = 470.00m, Price = 470.00m, TotalQuantity = 32, Unit = "1 Box (24 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 19, ProductCode = "19", ProductName = "Kuchipudi Dance", CategoryId = 8, MRPPrice = 1311.11m, DiscountPercentage = 55.00m, DiscountPrice = 590.00m, Price = 590.00m, TotalQuantity = 26, Unit = "1 Box (30 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 20, ProductCode = "20", ProductName = "Rhythums", CategoryId = 8, MRPPrice = 1888.89m, DiscountPercentage = 55.00m, DiscountPrice = 850.00m, Price = 850.00m, TotalQuantity = 20, Unit = "1 Box (36 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 21, ProductCode = "21", ProductName = "Belley Dance-UV", CategoryId = 8, MRPPrice = 2155.56m, DiscountPercentage = 55.00m, DiscountPrice = 970.00m, Price = 970.00m, TotalQuantity = 18, Unit = "1 Box (42 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 22, ProductCode = "22", ProductName = "Kaithakali Dance-UV", CategoryId = 8, MRPPrice = 2755.56m, DiscountPercentage = 55.00m, DiscountPrice = 1240.00m, Price = 1240.00m, TotalQuantity = 12, Unit = "1 Box (51 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate },
                new Product { ProductId = 23, ProductCode = "23", ProductName = "Dragon Dance-UV", CategoryId = 8, MRPPrice = 3555.56m, DiscountPercentage = 55.00m, DiscountPrice = 1600.00m, Price = 1600.00m, TotalQuantity = 8, Unit = "1 Box (60 Items)", ImageUrl = "/assets/images/family-giftbox.jpg", IsAvailable = true, IsActive = true, CreatedDate = createdDate }
            );

            // Seed Customers
            modelBuilder.Entity<Customer>().HasData(
                new Customer { CustomerId = 1, FullName = "Karthick Raja", MobileNumber = "9443028771", Email = "karthick@gmail.com", Address = "3/347/U, Inthira Group House, Maraneri Village", City = "Sivakasi", Pincode = "626124", CreatedDate = createdDate },
                new Customer { CustomerId = 2, FullName = "Anand Kumar", MobileNumber = "9842155667", Email = "anand@gmail.com", Address = "45 Park Street", City = "Chennai", Pincode = "600001", CreatedDate = createdDate },
                new Customer { CustomerId = 3, FullName = "Priya Sundaram", MobileNumber = "9789012345", Email = "priya@gmail.com", Address = "78 Cross Lane", City = "Coimbatore", Pincode = "641002", CreatedDate = createdDate },
                new Customer { CustomerId = 4, FullName = "Suresh Babu", MobileNumber = "9443123456", Email = "suresh@gmail.com", Address = "90 Temple View", City = "Madurai", Pincode = "625001", CreatedDate = createdDate },
                new Customer { CustomerId = 5, FullName = "Deepa Murugan", MobileNumber = "9655443322", Email = "deepa@gmail.com", Address = "14 Lake Avenue", City = "Salem", Pincode = "636007", CreatedDate = createdDate }
            );

            // Seed Orders across dates and statuses
            modelBuilder.Entity<Order>().HasData(
                new Order { OrderId = 1, OrderNumber = "KC10001", CustomerId = 1, OrderDate = today.AddHours(10), Subtotal = 3850.00m, DeliveryCharge = 150.00m, TotalAmount = 4000.00m, OrderStatus = "Order Placed", PaymentStatus = "Pending", CreatedDate = today },
                new Order { OrderId = 2, OrderNumber = "KC10002", CustomerId = 2, OrderDate = today.AddHours(11), Subtotal = 1450.00m, DeliveryCharge = 100.00m, TotalAmount = 1550.00m, OrderStatus = "Confirmed", PaymentStatus = "Paid", CreatedDate = today },
                new Order { OrderId = 3, OrderNumber = "KC10003", CustomerId = 3, OrderDate = today.AddHours(12), Subtotal = 2800.00m, DeliveryCharge = 150.00m, TotalAmount = 2950.00m, OrderStatus = "Processing", PaymentStatus = "Paid", CreatedDate = today },
                new Order { OrderId = 4, OrderNumber = "KC10004", CustomerId = 4, OrderDate = today.AddDays(-1), Subtotal = 6500.00m, DeliveryCharge = 0.00m, TotalAmount = 6500.00m, OrderStatus = "Dispatched", PaymentStatus = "Paid", CreatedDate = today.AddDays(-1) },
                new Order { OrderId = 5, OrderNumber = "KC10005", CustomerId = 5, OrderDate = today.AddDays(-2), Subtotal = 1200.00m, DeliveryCharge = 100.00m, TotalAmount = 1300.00m, OrderStatus = "Delivered", PaymentStatus = "Paid", CreatedDate = today.AddDays(-2) },
                new Order { OrderId = 6, OrderNumber = "KC10006", CustomerId = 1, OrderDate = today.AddDays(-3), Subtotal = 450.00m, DeliveryCharge = 100.00m, TotalAmount = 550.00m, OrderStatus = "Cancelled", PaymentStatus = "Failed", CreatedDate = today.AddDays(-3) },
                new Order { OrderId = 7, OrderNumber = "KC10007", CustomerId = 2, OrderDate = today.AddDays(-4), Subtotal = 2450.00m, DeliveryCharge = 150.00m, TotalAmount = 2600.00m, OrderStatus = "Delivered", PaymentStatus = "Paid", CreatedDate = today.AddDays(-4) }
            );

            // Seed OrderItems
            modelBuilder.Entity<OrderItem>().HasData(
                new OrderItem { OrderItemId = 1, OrderId = 1, ProductId = 15, ProductName = "Royal Family Gift Box", ProductCode = "15", Quantity = 1, UnitPrice = 3850.00m, TotalPrice = 3850.00m },
                new OrderItem { OrderItemId = 2, OrderId = 2, ProductId = 8, ProductName = "Thunder King 10-Shot Cake", ProductCode = "401", Quantity = 1, UnitPrice = 1450.00m, TotalPrice = 1450.00m },
                new OrderItem { OrderItemId = 3, OrderId = 3, ProductId = 9, ProductName = "30-Shot Multi Color Aerial", ProductCode = "402", Quantity = 1, UnitPrice = 2800.00m, TotalPrice = 2800.00m }
            );

            // Seed OrderStatusHistory
            modelBuilder.Entity<OrderStatusHistory>().HasData(
                new OrderStatusHistory { OrderStatusHistoryId = 1, OrderId = 1, OldStatus = null, NewStatus = "Order Placed", ChangedDate = today.AddHours(10), Remarks = "Order placed online" },
                new OrderStatusHistory { OrderStatusHistoryId = 2, OrderId = 2, OldStatus = "Order Placed", NewStatus = "Confirmed", ChangedDate = today.AddHours(11), Remarks = "Payment verified" }
            );
        }
    }
}
