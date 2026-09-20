using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using KarthickCrackers.Api.Entities;

namespace KarthickCrackers.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Unconditionally update all product codes to simple numeric format starting from 1, 2, 3... (not 1000+)
            context.Database.ExecuteSqlRaw(@"
                UPDATE [Products] SET [ProductCode] = CAST([ProductId] AS nvarchar(50));
                UPDATE [OrderItems] SET [ProductCode] = CAST([ProductId] AS nvarchar(50));

                -- Update product image URLs for Product Code 32 (5g Free Fire Gun) and Product Code 33 (Jackpot Currency)
                UPDATE [Products] SET [ImageUrl] = '/assets/images/5g-free-fire-gun.jpg' WHERE [ProductCode] = '32' OR [ProductName] LIKE '%Free Fire%';
                UPDATE [Products] SET [ImageUrl] = '/assets/images/jackpot-currency.jpg' WHERE [ProductCode] = '33' OR [ProductName] LIKE '%Jackpot Currency%' OR [ProductName] LIKE '%Money in Bank%';

                IF NOT EXISTS (SELECT * FROM [Products] WHERE [ProductCode] = '32' OR [ProductName] LIKE '%Free Fire%')
                BEGIN
                    INSERT INTO [Products] ([ProductCode], [ProductName], [CategoryId], [Description], [Price], [MRPPrice], [DiscountPercentage], [DiscountPrice], [TotalQuantity], [Unit], [ImageUrl], [IsAvailable], [IsActive], [CreatedDate])
                    VALUES ('32', '5G Free Fire Gun', 6, 'Reshma Free Fire 5G Speed Gun Toy Crackers', 150.00, 333.33, 55.00, 150.00, 50, '1 Box', '/assets/images/5g-free-fire-gun.jpg', 1, 1, GETUTCDATE());
                END

                IF NOT EXISTS (SELECT * FROM [Products] WHERE [ProductCode] = '33' OR [ProductName] LIKE '%Jackpot Currency%' OR [ProductName] LIKE '%Money in Bank%')
                BEGIN
                    INSERT INTO [Products] ([ProductCode], [ProductName], [CategoryId], [Description], [Price], [MRPPrice], [DiscountPercentage], [DiscountPrice], [TotalQuantity], [Unit], [ImageUrl], [IsAvailable], [IsActive], [CreatedDate])
                    VALUES ('33', 'Jackpot Currency', 6, 'Starvell Money In Bank / Jackpot Currency 3 Pcs Box', 200.00, 444.44, 55.00, 200.00, 50, '1 Box (3 Pcs)', '/assets/images/jackpot-currency.jpg', 1, 1, GETUTCDATE());
                END
            ");

            // Seed/Synchronize the official 9 Premium Gift Boxes into Category 8 safely
            context.Database.ExecuteSqlRaw(@"
                UPDATE [OrderItems] SET [ProductId] = 1 WHERE [ProductId] IN (SELECT [ProductId] FROM [Products] WHERE [CategoryId] = 8 OR [ProductName] LIKE '%Gift Box%');
                DELETE FROM [Products] WHERE [CategoryId] = 8 OR [ProductName] LIKE '%Gift Box%';
                
                INSERT INTO [Products] ([ProductCode], [ProductName], [CategoryId], [Description], [Price], [MRPPrice], [DiscountPercentage], [DiscountPrice], [TotalQuantity], [Unit], [ImageUrl], [IsAvailable], [IsActive], [CreatedDate])
                VALUES
                ('TEMP-15', 'Zumba Dance', 8, 'Premium Diwali Gift Box with 12 Items', 236.00, 524.44, 55.00, 236.00, 60, '1 Box (12 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-16', 'Super Star', 8, 'Premium Diwali Gift Box with 18 Items', 320.00, 711.11, 55.00, 320.00, 45, '1 Box (18 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-17', 'Peacock Dance-UV', 8, 'Premium Diwali Gift Box with 21 Items', 395.00, 877.78, 55.00, 395.00, 38, '1 Box (21 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-18', 'Samba Party', 8, 'Premium Diwali Gift Box with 24 Items', 470.00, 1044.44, 55.00, 470.00, 32, '1 Box (24 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-19', 'Kuchipudi Dance', 8, 'Premium Diwali Gift Box with 30 Items', 590.00, 1311.11, 55.00, 590.00, 26, '1 Box (30 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-20', 'Rhythums', 8, 'Premium Diwali Gift Box with 36 Items', 850.00, 1888.89, 55.00, 850.00, 20, '1 Box (36 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-21', 'Belley Dance-UV', 8, 'Premium Diwali Gift Box with 42 Items', 970.00, 2155.56, 55.00, 970.00, 18, '1 Box (42 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-22', 'Kaithakali Dance-UV', 8, 'Premium Diwali Gift Box with 51 Items', 1240.00, 2755.56, 55.00, 1240.00, 12, '1 Box (51 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE()),
                ('TEMP-23', 'Dragon Dance-UV', 8, 'Premium Diwali Gift Box with 60 Items', 1600.00, 3555.56, 55.00, 1600.00, 8, '1 Box (60 Items)', '/assets/images/family-giftbox.jpg', 1, 1, GETUTCDATE());

                UPDATE [Products] SET [ProductCode] = CAST([ProductId] AS nvarchar(50));
            ");

            // Explicitly sync Admin Email and Password to Vinayaga@2010
            var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            var adminUser = context.Users.FirstOrDefault(u => u.Role == "Admin" || u.UserId == 1);
            if (adminUser != null)
            {
                adminUser.Email = "karthickkumar2014000@gmail.com";
                adminUser.PasswordHash = hasher.HashPassword(adminUser, "Vinayaga@2010");
                context.SaveChanges();
            }

            // Explicitly create missing columns/tables safely using T-SQL if missing
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'MobileNumber')
                BEGIN
                    ALTER TABLE [Users] ADD [MobileNumber] nvarchar(20) NULL;
                END
                EXEC('UPDATE [Users] SET [MobileNumber] = ''7010616198'' WHERE [Role] = ''Admin'' AND ([MobileNumber] IS NULL OR [MobileNumber] = '''')');

                -- FIX: Add ModifiedDate column to Orders table if missing (required by EF Core Order entity)
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'ModifiedDate')
                BEGIN
                    ALTER TABLE [Orders] ADD [ModifiedDate] datetime2 NULL;
                END

                -- FIX: Drop FK_Orders_Customers if it exists (EF Core model has no FK, cascade causes issues)
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Customers' AND parent_object_id = OBJECT_ID('Orders'))
                BEGIN
                    ALTER TABLE [Orders] DROP CONSTRAINT [FK_Orders_Customers];
                END
            ");

            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
                BEGIN
                    CREATE TABLE [Categories] (
                        [CategoryId] int NOT NULL IDENTITY(1,1),
                        [CategoryName] nvarchar(100) NOT NULL,
                        [Description] nvarchar(max) NULL,
                        [IsActive] bit NOT NULL DEFAULT 1,
                        [CreatedDate] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [ModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_Categories] PRIMARY KEY ([CategoryId])
                    );
                    CREATE UNIQUE INDEX [IX_Categories_CategoryName] ON [Categories] ([CategoryName]);
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
                BEGIN
                    CREATE TABLE [Products] (
                        [ProductId] int NOT NULL IDENTITY(1,1),
                        [ProductCode] nvarchar(50) NOT NULL,
                        [ProductName] nvarchar(150) NOT NULL,
                        [CategoryId] int NOT NULL,
                        [Description] nvarchar(max) NULL,
                        [Price] decimal(18,2) NOT NULL,
                        [MRPPrice] decimal(18,2) NOT NULL DEFAULT 0,
                        [DiscountPercentage] decimal(18,2) NOT NULL DEFAULT 0,
                        [DiscountPrice] decimal(18,2) NOT NULL DEFAULT 0,
                        [TotalQuantity] int NOT NULL DEFAULT 50,
                        [Unit] nvarchar(50) NULL,
                        [ImageUrl] nvarchar(max) NULL,
                        [IsAvailable] bit NOT NULL DEFAULT 1,
                        [IsActive] bit NOT NULL DEFAULT 1,
                        [CreatedDate] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [ModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_Products] PRIMARY KEY ([ProductId])
                    );
                    CREATE UNIQUE INDEX [IX_Products_ProductCode] ON [Products] ([ProductCode]);
                END

                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'MRPPrice')
                BEGIN
                    ALTER TABLE [Products] ADD [MRPPrice] decimal(18,2) NOT NULL DEFAULT 0;
                    ALTER TABLE [Products] ADD [DiscountPercentage] decimal(18,2) NOT NULL DEFAULT 0;
                    ALTER TABLE [Products] ADD [DiscountPrice] decimal(18,2) NOT NULL DEFAULT 0;
                    ALTER TABLE [Products] ADD [TotalQuantity] int NOT NULL DEFAULT 50;
                    EXEC('UPDATE [Products] SET [MRPPrice] = [Price], [DiscountPrice] = [Price], [TotalQuantity] = 50 WHERE [MRPPrice] = 0');
                END

                -- Ensure DiscountPercentage column in Products table is decimal(18,2) if it was created as INT
                IF EXISTS (
                    SELECT * FROM sys.columns c
                    JOIN sys.types t ON c.user_type_id = t.user_type_id
                    WHERE c.object_id = OBJECT_ID('Products') 
                      AND c.name = 'DiscountPercentage' 
                      AND t.name IN ('int', 'bigint', 'smallint', 'tinyint')
                )
                BEGIN
                    DECLARE @ConstraintName nvarchar(200);
                    SELECT @ConstraintName = d.name
                    FROM sys.default_constraints d
                    JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
                    WHERE d.parent_object_id = OBJECT_ID('Products') AND c.name = 'DiscountPercentage';

                    IF @ConstraintName IS NOT NULL
                    BEGIN
                        EXEC('ALTER TABLE [Products] DROP CONSTRAINT [' + @ConstraintName + ']');
                    END

                    ALTER TABLE [Products] ALTER COLUMN [DiscountPercentage] decimal(18,2) NOT NULL;
                    ALTER TABLE [Products] ADD CONSTRAINT [DF_Products_DiscountPercentage] DEFAULT 0 FOR [DiscountPercentage];
                END

                -- Automatically clean up any existing KC- or KHC- product code prefixes in the database
                EXEC('UPDATE [Products] SET [ProductCode] = REPLACE(REPLACE(REPLACE([ProductCode], ''KC-'', ''''), ''KHC-'', ''''), ''KC'', '''') WHERE [ProductCode] LIKE ''%KC%'' OR [ProductCode] LIKE ''%KHC%''');
                EXEC('UPDATE [OrderItems] SET [ProductCode] = REPLACE(REPLACE(REPLACE([ProductCode], ''KC-'', ''''), ''KHC-'', ''''), ''KC'', '''') WHERE [ProductCode] LIKE ''%KC%'' OR [ProductCode] LIKE ''%KHC%''');

                -- FIX: Add CategorySlug if missing
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'CategorySlug')
                BEGIN
                    ALTER TABLE [Categories] ADD [CategorySlug] nvarchar(255) NULL;
                    EXEC('UPDATE [Categories] SET [CategorySlug] = LOWER(REPLACE(REPLACE(REPLACE([CategoryName], '' '', ''-''), ''&'', ''and''), '','', '''')) WHERE [CategorySlug] IS NULL');
                END

                -- FIX: Add ProductSlug if missing
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ProductSlug')
                BEGIN
                    ALTER TABLE [Products] ADD [ProductSlug] nvarchar(255) NULL;
                    EXEC('UPDATE [Products] SET [ProductSlug] = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE([ProductName], '' '', ''-''), ''&'', ''and''), '','', ''''), ''/'', ''-''), ''('', ''''), '')'', '''')) + ''-'' + [ProductCode] WHERE [ProductSlug] IS NULL');
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
                BEGIN
                    CREATE TABLE [Customers] (
                        [CustomerId] int NOT NULL IDENTITY(1,1),
                        [FullName] nvarchar(150) NOT NULL,
                        [MobileNumber] nvarchar(20) NOT NULL,
                        [Email] nvarchar(150) NULL,
                        [Address] nvarchar(max) NULL,
                        [City] nvarchar(100) NULL,
                        [Pincode] nvarchar(20) NULL,
                        [Remarks] nvarchar(max) NULL,
                        [CreatedDate] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [ModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_Customers] PRIMARY KEY ([CustomerId])
                    );
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
                BEGIN
                    CREATE TABLE [Orders] (
                        [OrderId] int NOT NULL IDENTITY(1,1),
                        [OrderNumber] nvarchar(50) NOT NULL,
                        [CustomerId] int NOT NULL,
                        [OrderDate] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [Subtotal] decimal(18,2) NOT NULL,
                        [DeliveryCharge] decimal(18,2) NOT NULL,
                        [TotalAmount] decimal(18,2) NOT NULL,
                        [OrderStatus] nvarchar(50) NOT NULL,
                        [PaymentStatus] nvarchar(50) NOT NULL,
                        [CreatedDate] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [ModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_Orders] PRIMARY KEY ([OrderId])
                    );
                    CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [Orders] ([OrderNumber]);
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
                BEGIN
                    CREATE TABLE [OrderItems] (
                        [OrderItemId] int NOT NULL IDENTITY(1,1),
                        [OrderId] int NOT NULL,
                        [ProductId] int NOT NULL,
                        [ProductName] nvarchar(150) NOT NULL,
                        [ProductCode] nvarchar(50) NOT NULL,
                        [Quantity] int NOT NULL,
                        [UnitPrice] decimal(18,2) NOT NULL,
                        [TotalPrice] decimal(18,2) NOT NULL,
                        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([OrderItemId]),
                        CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY ([OrderId]) REFERENCES [Orders]([OrderId]) ON DELETE CASCADE,
                        CONSTRAINT [FK_OrderItems_Products] FOREIGN KEY ([ProductId]) REFERENCES [Products]([ProductId])
                    );
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderStatusHistories')
                BEGIN
                    CREATE TABLE [OrderStatusHistories] (
                        [OrderStatusHistoryId] int NOT NULL IDENTITY(1,1),
                        [OrderId] int NOT NULL,
                        [OldStatus] nvarchar(50) NULL,
                        [NewStatus] nvarchar(50) NOT NULL,
                        [ChangedDate] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [Remarks] nvarchar(max) NULL,
                        CONSTRAINT [PK_OrderStatusHistories] PRIMARY KEY ([OrderStatusHistoryId])
                    );
                END

                -- Ensure HistoryId is renamed to OrderStatusHistoryId if created by legacy import script
                IF EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID('OrderStatusHistories') AND name = 'HistoryId'
                )
                BEGIN
                    EXEC sp_rename 'OrderStatusHistories.HistoryId', 'OrderStatusHistoryId', 'COLUMN';
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PaymentSettings')
                BEGIN
                    CREATE TABLE [PaymentSettings] (
                        [Id] int NOT NULL IDENTITY(1,1),
                        [UpiId] nvarchar(100) NOT NULL,
                        [UpiQrCodeUrl] nvarchar(500) NOT NULL,
                        [CallNumber] nvarchar(50) NOT NULL,
                        [AccountHolder] nvarchar(max) NULL,
                        [BankName] nvarchar(max) NULL,
                        [AccountNumber] nvarchar(max) NULL,
                        [IfscCode] nvarchar(max) NULL,
                        [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        CONSTRAINT [PK_PaymentSettings] PRIMARY KEY ([Id])
                    );
                    INSERT INTO [PaymentSettings] ([UpiId], [UpiQrCodeUrl], [CallNumber], [UpdatedAt])
                    VALUES ('9952378965@upi', '/assets/images/upi-qr.png', '+91 6380891094', GETUTCDATE());
                END
                ELSE
                BEGIN
                    UPDATE [PaymentSettings] SET [CallNumber] = '+91 6380891094' WHERE [CallNumber] LIKE '%94430%';
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WhatsAppLogs')
                BEGIN
                    CREATE TABLE [WhatsAppLogs] (
                        [Id] int NOT NULL IDENTITY(1,1),
                        [OrderId] int NOT NULL,
                        [CustomerId] int NOT NULL,
                        [PhoneNumber] nvarchar(20) NOT NULL,
                        [TemplateName] nvarchar(100) NOT NULL,
                        [WhatsAppMessageId] nvarchar(100) NULL,
                        [Status] nvarchar(50) NOT NULL,
                        [ErrorMessage] nvarchar(max) NULL,
                        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
                        [SentAt] datetime2 NULL,
                        CONSTRAINT [PK_WhatsAppLogs] PRIMARY KEY ([Id])
                    );
                    CREATE INDEX [IX_WhatsAppLogs_OrderId_TemplateName] ON [WhatsAppLogs] ([OrderId], [TemplateName]);
                END
            ");

            // Ensure Categories exist
            if (!context.Categories.Any())
            {
                var createdDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                context.Categories.AddRange(
                    new Category { CategoryName = "Sparklers", Description = "Electric & Colour Sparklers", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Ground Chakkars", Description = "Spinning Wheels & Whistling Chakkars", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Flower Pots", Description = "Golden & Silver Fountains", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Aerial Shots", Description = "Multi-shot Fancy Sky Aerial Cakes", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Rockets", Description = "Sky Rockets & Lunik Bombs", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Kids Novelty", Description = "Pop-Pop, Flash Guns & Cartoons", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Sound Crackers", Description = "Bijili, Atom Bombs & Garland Crackers", IsActive = true, CreatedDate = createdDate },
                    new Category { CategoryName = "Gift Boxes", Description = "Diwali Family Assorted Gift Packs", IsActive = true, CreatedDate = createdDate }
                );
                context.SaveChanges();
            }

            // Products are managed dynamically or via bulk import
            // Initial seed of KC products has been removed as per requirement

            // Ensure Customers exist
            if (!context.Customers.Any())
            {
                var createdDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                context.Customers.AddRange(
                    new Customer { FullName = "Karthick Raja", MobileNumber = "9443028771", Email = "karthick@gmail.com", Address = "3/347/U, Inthira Group House, Maraneri Village", City = "Sivakasi", Pincode = "626124", CreatedDate = createdDate },
                    new Customer { FullName = "Anand Kumar", MobileNumber = "9842155667", Email = "anand@gmail.com", Address = "45 Park Street", City = "Chennai", Pincode = "600001", CreatedDate = createdDate },
                    new Customer { FullName = "Priya Sundaram", MobileNumber = "9789012345", Email = "priya@gmail.com", Address = "78 Cross Lane", City = "Coimbatore", Pincode = "641002", CreatedDate = createdDate },
                    new Customer { FullName = "Suresh Babu", MobileNumber = "9443123456", Email = "suresh@gmail.com", Address = "90 Temple View", City = "Madurai", Pincode = "625001", CreatedDate = createdDate },
                    new Customer { FullName = "Deepa Murugan", MobileNumber = "9655443322", Email = "deepa@gmail.com", Address = "14 Lake Avenue", City = "Salem", Pincode = "636007", CreatedDate = createdDate }
                );
                context.SaveChanges();
            }

            // Ensure Orders exist
            if (!context.Orders.Any())
            {
                var today = DateTime.UtcNow.Date;
                var cust1 = context.Customers.FirstOrDefault(c => c.FullName == "Karthick Raja")?.CustomerId ?? 1;
                var cust2 = context.Customers.FirstOrDefault(c => c.FullName == "Anand Kumar")?.CustomerId ?? 2;
                var cust3 = context.Customers.FirstOrDefault(c => c.FullName == "Priya Sundaram")?.CustomerId ?? 3;
                var cust4 = context.Customers.FirstOrDefault(c => c.FullName == "Suresh Babu")?.CustomerId ?? 4;
                var cust5 = context.Customers.FirstOrDefault(c => c.FullName == "Deepa Murugan")?.CustomerId ?? 5;

                context.Orders.AddRange(
                    new Order { OrderNumber = "KC10001", CustomerId = cust1, OrderDate = today.AddHours(10), Subtotal = 3850.00m, DeliveryCharge = 150.00m, TotalAmount = 4000.00m, OrderStatus = "Order Placed", PaymentStatus = "Pending", CreatedDate = today },
                    new Order { OrderNumber = "KC10002", CustomerId = cust2, OrderDate = today.AddHours(11), Subtotal = 1450.00m, DeliveryCharge = 100.00m, TotalAmount = 1550.00m, OrderStatus = "Confirmed", PaymentStatus = "Paid", CreatedDate = today },
                    new Order { OrderNumber = "KC10003", CustomerId = cust3, OrderDate = today.AddHours(12), Subtotal = 2800.00m, DeliveryCharge = 150.00m, TotalAmount = 2950.00m, OrderStatus = "Processing", PaymentStatus = "Paid", CreatedDate = today },
                    new Order { OrderNumber = "KC10004", CustomerId = cust4, OrderDate = today.AddDays(-1), Subtotal = 6500.00m, DeliveryCharge = 0.00m, TotalAmount = 6500.00m, OrderStatus = "Dispatched", PaymentStatus = "Paid", CreatedDate = today.AddDays(-1) },
                    new Order { OrderNumber = "KC10005", CustomerId = cust5, OrderDate = today.AddDays(-2), Subtotal = 1200.00m, DeliveryCharge = 100.00m, TotalAmount = 1300.00m, OrderStatus = "Delivered", PaymentStatus = "Paid", CreatedDate = today.AddDays(-2) },
                    new Order { OrderNumber = "KC10006", CustomerId = cust1, OrderDate = today.AddDays(-3), Subtotal = 450.00m, DeliveryCharge = 100.00m, TotalAmount = 550.00m, OrderStatus = "Cancelled", PaymentStatus = "Failed", CreatedDate = today.AddDays(-3) },
                    new Order { OrderNumber = "KC10007", CustomerId = cust2, OrderDate = today.AddDays(-4), Subtotal = 2450.00m, DeliveryCharge = 150.00m, TotalAmount = 2600.00m, OrderStatus = "Delivered", PaymentStatus = "Paid", CreatedDate = today.AddDays(-4) }
                );
                context.SaveChanges();
            }
        }
    }
}
