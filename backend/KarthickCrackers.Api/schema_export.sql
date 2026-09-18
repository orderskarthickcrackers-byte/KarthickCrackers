-- ============================================================
-- KARTHICK CRACKERS - FULL SQL SERVER DATABASE DEPLOYMENT SCRIPT
-- Target: SQL Server 2016+ / Azure SQL Database / MonsterASP / SmarterASP
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'KarthickCrackersDb')
BEGIN
    CREATE DATABASE [KarthickCrackersDb];
END
GO

USE [KarthickCrackersDb];
GO

-- 1. CATEGORIES TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Categories] (
        [CategoryId] INT IDENTITY(1,1) NOT NULL,
        [CategoryName] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([CategoryId] ASC)
    );
END
GO

-- 2. PRODUCTS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Products] (
        [ProductId] INT IDENTITY(1,1) NOT NULL,
        [ProductCode] NVARCHAR(50) NOT NULL,
        [ProductName] NVARCHAR(200) NOT NULL,
        [CategoryId] INT NOT NULL,
        [Price] DECIMAL(18,2) NOT NULL,
        [MRPPrice] DECIMAL(18,2) NULL,
        [DiscountPercentage] INT NOT NULL DEFAULT 0,
        [DiscountPrice] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [Unit] NVARCHAR(50) NOT NULL,
        [TotalQuantity] INT NOT NULL DEFAULT 100,
        [Description] NVARCHAR(MAX) NULL,
        [ImageUrl] NVARCHAR(500) NULL,
        [IsAvailable] BIT NOT NULL DEFAULT 1,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([ProductId] ASC),
        CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([CategoryId]) ON DELETE CASCADE
    );
END
GO

-- 3. CUSTOMERS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Customers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Customers] (
        [CustomerId] INT IDENTITY(1,1) NOT NULL,
        [FullName] NVARCHAR(150) NOT NULL,
        [MobileNumber] NVARCHAR(20) NOT NULL,
        [Email] NVARCHAR(150) NULL,
        [Address] NVARCHAR(MAX) NOT NULL,
        [City] NVARCHAR(100) NOT NULL,
        [Pincode] NVARCHAR(20) NOT NULL,
        [Remarks] NVARCHAR(MAX) NULL,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED ([CustomerId] ASC)
    );
END
GO

-- 4. ORDERS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Orders] (
        [OrderId] INT IDENTITY(1,1) NOT NULL,
        [OrderNumber] NVARCHAR(50) NOT NULL,
        [CustomerId] INT NOT NULL,
        [OrderDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [Subtotal] DECIMAL(18,2) NOT NULL,
        [DeliveryCharge] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [TotalAmount] DECIMAL(18,2) NOT NULL,
        [OrderStatus] NVARCHAR(50) NOT NULL DEFAULT 'Order Placed',
        [PaymentStatus] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Orders] PRIMARY KEY CLUSTERED ([OrderId] ASC),
        CONSTRAINT [FK_Orders_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers] ([CustomerId]) ON DELETE CASCADE
    );
END
GO

-- 5. ORDER ITEMS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrderItems]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[OrderItems] (
        [OrderItemId] INT IDENTITY(1,1) NOT NULL,
        [OrderId] INT NOT NULL,
        [ProductId] INT NOT NULL,
        [ProductName] NVARCHAR(200) NOT NULL,
        [ProductCode] NVARCHAR(50) NOT NULL,
        [Quantity] INT NOT NULL,
        [UnitPrice] DECIMAL(18,2) NOT NULL,
        [TotalPrice] DECIMAL(18,2) NOT NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY CLUSTERED ([OrderItemId] ASC),
        CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([OrderId]) ON DELETE CASCADE
    );
END
GO

-- 6. ORDER STATUS HISTORY TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrderStatusHistories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[OrderStatusHistories] (
        [HistoryId] INT IDENTITY(1,1) NOT NULL,
        [OrderId] INT NOT NULL,
        [OldStatus] NVARCHAR(50) NULL,
        [NewStatus] NVARCHAR(50) NOT NULL,
        [ChangedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [Remarks] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_OrderStatusHistories] PRIMARY KEY CLUSTERED ([HistoryId] ASC),
        CONSTRAINT [FK_OrderStatusHistories_Orders] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders] ([OrderId]) ON DELETE CASCADE
    );
END
GO

-- 7. USERS TABLE (ADMIN ACCESS)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [UserId] INT IDENTITY(1,1) NOT NULL,
        [Email] NVARCHAR(150) NOT NULL,
        [MobileNumber] NVARCHAR(20) NULL,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [Role] NVARCHAR(50) NOT NULL DEFAULT 'Admin',
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ModifiedDate] DATETIME2 NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserId] ASC)
    );
END
GO

-- 8. PAYMENT SETTINGS TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaymentSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PaymentSettings] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [UpiId] NVARCHAR(100) NOT NULL DEFAULT '9952378965@upi',
        [UpiQrCodeUrl] NVARCHAR(300) NOT NULL DEFAULT '/assets/images/upi-qr.png',
        [CallNumber] NVARCHAR(50) NOT NULL DEFAULT '+91 6380891094',
        [AccountHolder] NVARCHAR(150) NULL,
        [BankName] NVARCHAR(150) NULL,
        [AccountNumber] NVARCHAR(100) NULL,
        [IfscCode] NVARCHAR(50) NULL,
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_PaymentSettings] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- 9. WHATSAPP LOGS TABLE (META WHATSAPP API AUDIT TRAIL)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WhatsAppLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[WhatsAppLogs] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [OrderId] INT NOT NULL,
        [CustomerId] INT NOT NULL,
        [PhoneNumber] NVARCHAR(20) NOT NULL,
        [TemplateName] NVARCHAR(100) NOT NULL,
        [WhatsAppMessageId] NVARCHAR(100) NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        [ErrorMessage] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [SentAt] DATETIME2 NULL,
        CONSTRAINT [PK_WhatsAppLogs] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    CREATE INDEX [IX_WhatsAppLogs_OrderId_TemplateName] ON [dbo].[WhatsAppLogs] ([OrderId], [TemplateName]);
END
GO

-- SEED PAYMENT SETTINGS
IF NOT EXISTS (SELECT 1 FROM [dbo].[PaymentSettings])
BEGIN
    INSERT INTO [dbo].[PaymentSettings] ([UpiId], [UpiQrCodeUrl], [CallNumber], [AccountHolder], [BankName], [AccountNumber], [IfscCode], [UpdatedAt])
    VALUES ('9952378965@upi', '/assets/images/upi-qr.png', '+91 6380891094', 'Karthick Crackers', 'State Bank of India', '39876543210', 'SBIN0001234', GETUTCDATE());
END
GO
