-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: taxi2
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `airports`
--

DROP TABLE IF EXISTS `airports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airports` (
  `airport_id` varchar(255) NOT NULL,
  `airport_name` varchar(255) NOT NULL,
  `airport_code` varchar(10) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT NULL,
  `is_international` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`airport_id`),
  UNIQUE KEY `airport_code` (`airport_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airports`
--

LOCK TABLES `airports` WRITE;
/*!40000 ALTER TABLE `airports` DISABLE KEYS */;
INSERT INTO `airports` VALUES ('11111111-ffff-gggg-hhhh-iiiiiiiiiiii','Singapore Changi Airport','SIN','Changi','Singapore',1.35000000,103.99450000,'Asia/Singapore',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('11111111-oooo-pppp-qqqq-rrrrrrrrrrrr','Mexico City International Airport','MEX','Mexico City','Mexico',19.43260000,-99.08610000,'America/Mexico_City',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('11111111-ppppppppp-qqqqqqqqq-rrrrrrrrrr-ssssssssss','Shanghai Hongqiao International Airport','SHA','Shanghai','China',31.19580000,121.33580000,'Asia/Shanghai',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('11111111-xxxx-yyyy-zzzz-aaaaaaaaaa','Seattle–Tacoma International Airport','SEA','Seattle','United States',47.44890000,-122.30930000,'America/Los_Angeles',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('12345678-9012-3456-7890-123456789012c','O\'Hare International Airport','ORD','Chicago','United States',41.97860000,-87.90480000,'America/Chicago',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('1a564532-a45b-412c-8c9a-7b6812345678','Dallas Fort Worth International Airport','DFW','Dallas-Fort Worth','United States',32.89590000,-97.03720000,'America/Chicago',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('22222222-gggg-hhhh-iiii-jjjjjjjjjjjjjj','Orlando International Airport','MCO','Orlando','United States',28.53820000,-81.37920000,'America/New_York',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('22222222-hhhhh-iiii-jjjj-kkkkkkkkk','Newark Liberty International Airport','EWR','Newark','United States',40.69250000,-74.17450000,'America/New_York',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('22222222-pppp-qqqq-rrrr-ssssssssssss','Kuala Lumpur International Airport','KUL','Sepang','Malaysia',2.74640000,101.71390000,'Asia/Kuala_Lumpur',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('22222222-yyyy-zzzz-aaaaa-bbbbbbbbb','Toronto Pearson International Airport','YYZ','Mississauga','Canada',43.67720000,-79.63050000,'America/Toronto',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('31e45520-9a55-4a4c-8302-a8648b9d1b09','Hartsfield–Jackson Atlanta International Airport','ATL','Atlanta','United States',33.64070000,-84.42770000,'America/Atlanta',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('33333333-hhhh-iiii-jjjj-kkkkkkkkkkkk','Harry Reid International Airport','LAS','Las Vegas','United States',36.08010000,-115.15230000,'America/Los_Angeles',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('33333333-iiiii-jjjj-kkkk-llllllll','Sheremetyevo International Airport','SVO','Khimki','Russia',55.97200000,37.41140000,'Europe/Moscow',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('34567890-1234-5678-9012-345678901234c','Indira Gandhi International Airport','DEL','Delhi','India',28.56960000,77.10280000,'Asia/Kolkata',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('3c3179b-748d-4eeb-87b8-0e89b8126b76','Aéroport de Nantes Atlantique','NTE','Nantes','France',47.15310000,-1.61030000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('42678901-2345-4678-9012-fedcba987654c','Tokyo Haneda Airport','HND','Tokyo','Japan',35.54890000,139.77940000,'Asia/Tokyo',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('44444444-iiii-jjjj-kkkk-llllllllllll','Seoul Incheon International Airport','ICN','Incheon','South Korea',37.46020000,126.44940000,'Asia/Seoul',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','Aéroport de Marrakech Menara','RAKff','Marrakech','Maroc',31.62560000,-8.04030000,'Afrique/Maroc',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('4d04f8f6-a98f-40b2-bffe-6148016c1a35','null','nulls','null','null',NULL,NULL,NULL,0,'2024-12-13 22:20:07','2024-12-13 22:20:07'),('55555555-aaaa-bbbb-cccc-dddddddddddd','Guangzhou Baiyun International Airport','CAN','Guangzhou','China',23.39640000,113.22140000,'Asia/Shanghai',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('55555555-jjjj-kkkk-llll-mmmmmmmmmmmm','Shanghai Pudong International Airport','PVG','Pudong','China',31.14580000,121.80580000,'Asia/Shanghai',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('55555555-kkkkk-lllll-mmmmmm-nnnnnnnnn','Phoenix Sky Harbor International Airport','PHX','Phoenix','United States',33.43420000,-112.00800000,'America/Phoenix',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('55555555-ssss-tttt-uuuu-vvvvvvvvvvvv','San Francisco International Airport','SFO','San Francisco','United States',37.61890000,-122.37480000,'America/Los_Angeles',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('56789012-3456-7890-1234-567890123456c','Los Angeles International Airport','LAX','Los Angeles','United States',33.94160000,-118.40850000,'America/Los_Angeles',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('5b3179b6-f7d9-4aae-9bf1-b3c99a34d212','Aéroport Mohammed V','CMN','Casablanca','Maroc',33.36770000,-7.58900000,'Afrique/Maroc',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('66666666-bbbb-cccc-dddd-eeeeeeeeeeee','John F. Kennedy International Airport','JFK','Queens','United States',40.64130000,-73.77810000,'America/New_York',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('66666666-ccccc-dddd-eeee-fffffffff','Kunming Changshui International Airport','KMG','Kunming','China',25.08580000,102.71390000,'Asia/Shanghai',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('66666666-kkkk-llll-mmmm-nnnnnnnnnnnn','Charlotte Douglas International Airport','CLT','Charlotte','United States',35.21400000,-80.94310000,'America/New_York',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('66666666-lllll-mmmmmm-nnnnnn-oooooooo','X`\'an Xianyang International Airport','XIY','Xi\'an','China',34.34250000,108.95360000,'Asia/Shanghai',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('66666666-tttt-uuuu-vvvv-wwwwwwwwww','Chengdu Shuangliu International Airport','CTU','Chengdu','China',30.65940000,103.96440000,'Asia/Shanghai',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('6c3179b6-f7d9-4aae-9bf1-b3c99a34d213','Aéroport de Tunis-Carthage','TUN','Tunis','Tunisie',33.82110000,10.22700000,'Afrique/Tunis',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('76543210-9876-5432-1098-765432109876c','Denver International Airport','DEN','Denver','United States',39.85840000,-104.67380000,'America/Denver',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('77777777-ddddd-eeee-ffff-ggggggggg','Taiwan Taoyuan International Airport','TPE','Taoyuan','Taiwan',25.07610000,121.22580000,'Asia/Taipei',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('77777777-llll-mmmm-nnnn-oooooooooooo','Beijing Capital International Airport','PEK','Beijing','China',40.07950000,116.58490000,'Asia/Shanghai',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('77777777-mmmmmm-nnnnnn-oooooooo-ppppppppp','Ninoy Aquino International Airport','MNL','Pasay','Philippines',14.53560000,120.98060000,'Asia/Manila',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('7d3179b6-f7d9-4aae-9bf1-b3c99a34d214','Aéroport d’Agadir-Al Massira','AGA','Agadir','Maroc',30.32560000,-9.41300000,'Africa/Casablanca',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('87654321-0123-4567-8901-234567890123c','Istanbul Airport','IST','Istanbul','Turkey',41.00140000,28.34880000,'Europe/Istanbul',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('88888888-mmmm-nnnn-oooo-pppppppppppp','Shenzhen Bao\'an International Airport','SZX','Shenzhen','China',22.63750000,113.79690000,'Asia/Shanghai',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('88888888-nnnnnn-oooooooo-ppppppppp-qqqqqqqqq','Sydney Kingsford-Smith Airport','SYD','Sydney','Australia',-33.94610000,151.17720000,'Australia/Sydney',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('88888888-vvvv-wwww-xxxx-yyyyyyyyyy','Chhatrapati Shivaji Maharaj International Airport','BOM','Mumbai','India',19.08870000,72.86790000,'Asia/Kolkata',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('8a5179b-3799-4d24-89bc-2519db4e2b7f','Aéroport de Lille-Lesquin','LIL','Lille','France',50.56080000,3.09760000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','Aéroport de Tanger Ibn Battouta','TNG','Tanger','Maroc',35.76430000,-5.91780000,'Africa/Casablanca',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('99999999-eeee-ffff-gggg-hhhhhhhhhhhh','Frankfurt Airport','FRA','Frankfurt','Germany',50.03330000,8.57050000,'Europe/Berlin',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('99999999-fffff-gggg-hhhh-iiiiiiiii','London Gatwick Airport','LGW','Crawley','United Kingdom',51.14750000,-0.19280000,'Europe/London',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('99999999-nnnn-oooo-pppp-qqqqqqqqqqqq','Miami International Airport','MIA','Miami','United States',25.79320000,-80.29060000,'America/New_York',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('99999999-oooooooo-ppppppppp-qqqqqqqqq-rrrrrrrrrr','George Bush Intercontinental Airport','IAH','Houston','United States',29.98440000,-95.34140000,'America/Chicago',1,'2024-12-14 00:06:50','2024-12-14 00:06:50'),('9f3179b6-f7d9-4aae-9bf1-b3c99a34d216','Aéroport de Nador Al Aroui','NDR','Nador','Maroc',35.14780000,-2.92830000,'Africa/Casablanca',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('9f387210-b5c4-4983-a12f-09876543210b','Heathrow Airport','LHR','London','United Kingdom',51.47000000,-0.45430000,'Europe/London',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('a03179b6-f7d9-4aae-9bf1-b3c99a34d217','Aéroport de Oujda Angad','OUD','Oujda','Maroc',34.76850000,-1.90120000,'Africa/Casablanca',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('a3e3179b-9829-477f-bb5c-1d7d9f2d46cb','Aéroport de Lyon-Saint-Exupéry','LYS','Lyon','France',45.72530000,5.08180000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('a3f3179b-1a2b-4c91-b3b6-31990fb5334e','Aéroport Adolfo Suárez Madrid-Barajas','MAD','Madrid','Espagne',40.45220000,-3.55980000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('a6ac569d-cb03-4236-bbe6-2099986dcece','null','null','null','null',NULL,NULL,NULL,0,'2024-12-13 22:19:17','2024-12-13 22:19:17'),('b0f3179b-4dcb-47d0-88e4-5b82b8b0b97b','Aéroport de Nice Côte d\'Azur','NCE','Nice','France',43.66580000,7.21620000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport de Rabat-Salé','RBA','Rabat','Maroc',34.02160000,-6.75910000,'Africa/Casablanca',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('b1f3179b-7d3d-4f06-b18c-b7d9bbbf25ba','Aéroport de Barcelone-El Prat','BCN','Barcelone','Espagne',41.29740000,2.08330000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('b4f3179b-2530-4751-9c58-76015a72b8ca','Aéroport de Bordeaux-Mérignac','BOD','Bordeaux','France',44.82920000,-0.71130000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('c25179b6-f7d9-4aae-9bf1-b3c99a34d219','Aéroport de Tétouan-Souk El Arba','TTU','Tétouan','Maroc',35.56760000,-5.36660000,'Africa/Casablanca',0,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('c2f3179b-8e1f-4d4c-85e9-4d8d460ba015','Aéroport de Palma de Majorque','PMI','Palma','Espagne',39.55190000,2.73800000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('c32c7e15-02c4-474a-ab7e-e437593f23e2','','','','',NULL,NULL,NULL,0,'2024-12-13 22:22:27','2024-12-13 22:22:27'),('c4f3179b-3c52-41ff-b0a4-b559a44b7c1f','Aéroport de Strasbourg-Entzheim','SXB','Strasbourg','France',48.53830000,7.62860000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('c5e3179b-e412-4a9b-b16d-46db6f3ecdf3','Aéroport de Marseille-Provence','MRS','Marseille','France',43.43930000,5.22150000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('d2d3179b-4b8e-4f02-a2c6-dab8a9fd6349','Aéroport Charles de Gaulle','CDG','Roissy-en-France','France',49.00970000,2.54780000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport de Dakhla','VIL','Dakhla','Maroc',23.73730000,-15.93960000,'Africa/Casablanca',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('d3f3179b-91e3-470b-a609-74289b9f7b0b','Aéroport de Málaga-Costa del Sol','AGP','Málaga','Espagne',36.67490000,-4.49920000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('d6b3179b-6d01-44f6-b879-76b38a53b67b','Aéroport de Beauvais-Tillé','BVA','Beauvais','France',49.89850000,2.11210000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('e4f3179b-b71f-4db2-8c7a-0bc0845c7e53','Aéroport de Valencia','VLC','Valencia','Espagne',39.48960000,-0.48170000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('e9824e00-c790-49c1-b044-b5a734a4d17a','Dubai International Airport','DXB','Dubai','United Arab Emirates',25.25290000,55.36440000,'Asia/Dubai',1,'2024-12-14 00:04:33','2024-12-14 00:04:33'),('f10179b-df50-4536-8f91-195c1a36bd49','Aéroport de Tallinn','TLL','Tallinn','Estonie',59.41390000,24.83280000,'Europe/Tallinn',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f10179b-ee50-4536-8f91-195c1a36be39','Aéroport de Bâle-Mulhouse-Fribourg','BSL','Bâle','Suisse',47.59030000,7.52910000,'Europe/Zurich',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f1b3179b-d1f2-4536-8f91-195c1a36bc5f','Aéroport de Zurich','ZRH','Zurich','Suisse',47.46470000,8.54920000,'Europe/Zurich',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f20179b-e050-4536-8f91-195c1a36bd59','Aéroport de Helsinki-Vantaa','HEL','Helsinki','Finlande',60.31720000,24.96330000,'Europe/Helsinki',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f2b3179b-8aeb-4b53-9123-6339bbd74690','Aéroport de Toulouse-Blagnac','TLS','Toulouse','France',43.62970000,1.36310000,'Europe/Paris',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f2b3179b-d2f2-4536-8f91-195c1a36bc6f','Aéroport de Genève','GVA','Genève','Suisse',46.23810000,6.10850000,'Europe/Zurich',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f30179b-e150-4536-8f91-195c1a36bd69','Aéroport de Riga','RIX','Riga','Lettonie',56.92360000,23.97170000,'Europe/Riga',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f3b3179b-d3f2-4536-8f91-195c1a36bc7f','Aéroport de Milan Malpensa','MXP','Milan','Italie',45.63060000,8.72220000,'Europe/Rome',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f40179b-e250-4536-8f91-195c1a36bd79','Aéroport de Vilnius','VNO','Vilnius','Lituanie',54.63490000,25.28620000,'Europe/Vilnius',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f40179b-f150-4536-8f91-195c1a36be69','Aéroport de Luxembourg','LUX','Luxembourg','Luxembourg',49.62280000,6.21110000,'Europe/Luxembourg',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f4b3179b-d4f2-4536-8f91-195c1a36bc8f','Aéroport de Rome Fiumicino','FCO','Rome','Italie',41.80030000,12.23890000,'Europe/Rome',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f50179b-e350-4536-8f91-195c1a36bd89','Aéroport de Varsovie Chopin','WAW','Varsovie','Pologne',52.16530000,20.96710000,'Europe/Warsaw',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f5b3179b-d5f2-4536-8f91-195c1a36bc9f','Aéroport de Bruxelles','BRU','Bruxelles','Belgique',50.90140000,4.48440000,'Europe/Brussels',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f5f3179b-4235-41f5-8aeb-bff5de4b440f','Aéroport de Séville','SVQ','Séville','Espagne',37.41720000,-5.89320000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f60179b-e450-4536-8f91-195c1a36bd99','Aéroport de Budapest Liszt Ferenc','BUD','Budapest','Hongrie',47.43330000,19.26110000,'Europe/Budapest',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f6b3179b-d6f2-4536-8f91-195c1a36bca9','Aéroport d’Amsterdam Schiphol','AMS','Amsterdam','Pays-Bas',52.30860000,4.76390000,'Europe/Amsterdam',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f70179b-e550-4536-8f91-195c1a36bda9','Aéroport de Ljubljana','LJU','Ljubljana','Slovénie',46.22500000,14.45720000,'Europe/Ljubljana',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f7b3179b-d7f2-4536-8f91-195c1a36bcb9','Aéroport de Munich','MUC','Munich','Allemagne',48.35380000,11.78610000,'Europe/Berlin',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f80179b-e650-4536-8f91-195c1a36bdb9','Aéroport de Sofia','SOF','Sofia','Bulgarie',42.69670000,23.41110000,'Europe/Sofia',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f80179b-f550-4536-8f91-195c1a36bea9','Aéroport de Bruxelles Charleroi','CRL','Charleroi','Belgique',50.45110000,4.45360000,'Europe/Brussels',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f8b3179b-d8f2-4536-8f91-195c1a36bcc9','Aéroport de Berlin-Tegel','TXL','Berlin','Allemagne',52.55970000,13.28770000,'Europe/Berlin',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f90179b-e750-4536-8f91-195c1a36bdc9','Aéroport de Bucarest Henri Coandă','OTP','Bucarest','Roumanie',44.57210000,26.10250000,'Europe/Bucharest',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f90179b-f650-4536-8f91-195c1a36beb9','Aéroport de Rotterdam-La Haye','RTM','Rotterdam','Pays-Bas',51.95690000,4.43750000,'Europe/Amsterdam',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('f9b3179b-d9f2-4536-8f91-195c1a36bcd9','Aéroport de Vienne','VIE','Vienne','Autriche',48.11030000,16.56970000,'Europe/Vienna',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fa3179b-da50-4536-8f91-195c1a36bce9','Aéroport de Stockholm Arlanda','ARN','Stockholm','Suède',59.65190000,17.91860000,'Europe/Stockholm',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fb0179b-e950-4536-8f91-195c1a36bde9','Aéroport de Skopje','SKP','Skopje','Macédoine du Nord',41.96190000,21.62110000,'Europe/Skopje',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fb3179b-db50-4536-8f91-195c1a36bcf9','Aéroport de Copenhague','CPH','Copenhague','Danemark',55.61730000,12.65640000,'Europe/Copenhagen',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fc0179b-ea50-4536-8f91-195c1a36bdf9','Aéroport de Podgorica','TGD','Podgorica','Monténégro',42.35970000,19.26110000,'Europe/Belgrade',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fc3179b-dc50-4536-8f91-195c1a36bd09','Aéroport de Lisbonne Humberto Delgado','LIS','Lisbonne','Portugal',38.78130000,-9.13550000,'Europe/Lisbon',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fd0179b-eb50-4536-8f91-195c1a36be09','Aéroport de Chisinau','KIV','Chisinau','Moldavie',46.92720000,28.93050000,'Europe/Chisinau',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fd3179b-dd50-4536-8f91-195c1a36bd19','Aéroport de Prague Václav Havel','PRG','Prague','République tchèque',50.10080000,14.26000000,'Europe/Prague',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fe0179b-ec50-4536-8f91-195c1a36be19','Aéroport de Tbilissi','TBS','Tbilissi','Géorgie',41.66940000,44.95470000,'Asia/Tbilisi',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('fe3179b-de50-4536-8f91-195c1a36bd29','Aéroport de Zagreb','ZAG','Zagreb','Croatie',45.74250000,16.06440000,'Europe/Zagreb',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('ff0179b-ed50-4536-8f91-195c1a36be29','Aéroport de Yerevan Zvartnots','EVN','Yerevan','Arménie',40.14770000,44.39550000,'Asia/Yerevan',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('ff3179b-df50-4536-8f91-195c1a36bd39','Aéroport de Belgrade Nikola Tesla','BEG','Belgrade','Serbie',44.81860000,20.30910000,'Europe/Belgrade',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('g6f3179b-8c27-45f5-b2f4-8e5a71b36db6','Aéroport de Bilbao','BIO','Bilbao','Espagne',43.30170000,-2.91030000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('h7f3179b-8d54-44b8-a2fd-e70e5e9b84b8','Aéroport de Las Palmas de Gran Canaria','LPA','Las Palmas','Espagne',27.93110000,-15.38610000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('i8f3179b-0227-4778-b6b1-f76d90f34727','Aéroport de Alicante-Elche','ALC','Alicante','Espagne',38.28230000,-0.55860000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('j9f3179b-3d7d-44ab-8476-21cd5c5cb91f','Aéroport de Zaragoza','ZAZ','Saragosse','Espagne',41.66610000,-1.04160000,'Europe/Madrid',1,'2020-12-25 11:33:16','2020-12-25 11:33:16');
/*!40000 ALTER TABLE `airports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `city_id` varchar(255) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `region` varchar(100) DEFAULT NULL,
  `population` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES ('6bdac365-d123-11ef-9a26-00090ffe0001','Casablanca','Grand Casablanca',3359818,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.57310000,-7.58980000),('6bdaca99-d123-11ef-9a26-00090ffe0001','Rabat','Rabat-Salé-Kénitra',577827,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',34.02090000,-6.84160000),('6bdacba3-d123-11ef-9a26-00090ffe0001','Marrakech','Marrakech-Safi',928850,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',31.62950000,-7.98110000),('6bdacc43-d123-11ef-9a26-00090ffe0001','Fès','Fès-Meknès',1112072,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',34.03310000,-5.00030000),('6bdaccda-d123-11ef-9a26-00090ffe0001','Tanger','Tanger-Tétouan-Al Hoceïma',947952,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',35.75950000,-5.83400000),('6bdacd70-d123-11ef-9a26-00090ffe0001','Agadir','Souss-Massa',421844,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',30.42780000,-9.59810000),('6bdace03-d123-11ef-9a26-00090ffe0001','Meknès','Fès-Meknès',632079,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.89550000,-5.54730000),('6bdace92-d123-11ef-9a26-00090ffe0001','Oujda','Oriental',494252,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',34.68140000,-1.90860000),('6bdacf2d-d123-11ef-9a26-00090ffe0001','Tétouan','Tanger-Tétouan-Al Hoceïma',380787,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',35.57850000,-5.36840000),('6bdacfc9-d123-11ef-9a26-00090ffe0001','Safi','Marrakech-Safi',308508,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',32.29940000,-9.23720000),('6bdad056-d123-11ef-9a26-00090ffe0001','Khouribga','Béni Mellal-Khénifra',196196,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',32.88110000,-6.90630000),('6bdad0f1-d123-11ef-9a26-00090ffe0001','El Jadida','Casablanca-Settat',194934,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.25600000,-8.50800000),('6bdad1a7-d123-11ef-9a26-00090ffe0001','Nador','Oriental',161726,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',35.16880000,-2.93350000),('6bdad237-d123-11ef-9a26-00090ffe0001','Kénitra','Rabat-Salé-Kénitra',431282,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',34.26100000,-6.58020000),('6bdad2d1-d123-11ef-9a26-00090ffe0001','Beni Mellal','Béni Mellal-Khénifra',192676,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',32.33720000,-6.34980000),('6bdad360-d123-11ef-9a26-00090ffe0001','Taza','Fès-Meknès',148406,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',34.21330000,-4.00880000),('6bdad3ef-d123-11ef-9a26-00090ffe0001','Mohammédia','Casablanca-Settat',208612,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.68610000,-7.38290000),('6bdad47b-d123-11ef-9a26-00090ffe0001','Larache','Tanger-Tétouan-Al Hoceïma',125008,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',35.19320000,-6.15570000),('6bdad503-d123-11ef-9a26-00090ffe0001','Settat','Casablanca-Settat',142250,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.00100000,-7.61660000),('6bdad58e-d123-11ef-9a26-00090ffe0001','Errachidia','Drâa-Tafilalet',92374,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',31.93140000,-4.42480000),('6bdad61b-d123-11ef-9a26-00090ffe0001','Al Hoceïma','Tanger-Tétouan-Al Hoceïma',56716,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',35.24410000,-3.93120000),('6bdad6bb-d123-11ef-9a26-00090ffe0001','Azrou','Fès-Meknès',101000,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.43700000,-5.21990000),('6bdad781-d123-11ef-9a26-00090ffe0001','Essaouira','Marrakech-Safi',77127,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',31.50850000,-9.75950000),('6bdad817-d123-11ef-9a26-00090ffe0001','Ifrane','Fès-Meknès',13141,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',33.53340000,-5.10540000),('6bdad8a3-d123-11ef-9a26-00090ffe0001','Guelmim','Guelmim-Oued Noun',187611,1,'2025-01-12 21:25:53','2025-01-12 21:25:53',28.98830000,-10.05740000);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_ratings`
--

DROP TABLE IF EXISTS `driver_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_ratings` (
  `rating_id` varchar(255) NOT NULL,
  `booking_id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `driver_id` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `review_text` text,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`rating_id`),
  KEY `booking_id` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `driver__ratings_driver_id` (`driver_id`),
  CONSTRAINT `driver_ratings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `ride_bookings` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_ratings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `driver_ratings_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_ratings`
--

LOCK TABLES `driver_ratings` WRITE;
/*!40000 ALTER TABLE `driver_ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(255) NOT NULL,
  `booking_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `payment_method` enum('CREDIT_CARD','DEBIT_CARD','PAYPAL','CASH') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_status` enum('PENDING','SUCCESSFUL','FAILED') NOT NULL DEFAULT 'PENDING',
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_datetime` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `user_id` (`user_id`),
  KEY `payments_booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `ride_bookings` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing_rules`
--

DROP TABLE IF EXISTS `pricing_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_rules` (
  `pricing_id` varchar(255) NOT NULL,
  `vehicle_type` enum('SEDAN','SUV','LUXURY','MINIVAN') NOT NULL,
  `base_fare` decimal(10,2) NOT NULL,
  `per_mile_rate` decimal(10,2) NOT NULL,
  `peak_hour_multiplier` decimal(4,2) DEFAULT '1.00',
  `valid_from` datetime DEFAULT NULL,
  `valid_to` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`pricing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing_rules`
--

LOCK TABLES `pricing_rules` WRITE;
/*!40000 ALTER TABLE `pricing_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricing_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ride_bookings`
--

DROP TABLE IF EXISTS `ride_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride_bookings` (
  `booking_id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `driver_id` varchar(255) DEFAULT NULL,
  `vehicle_id` varchar(255) DEFAULT NULL,
  `pickup_airport_id` varchar(255) NOT NULL,
  `dropoff_airport_id` varchar(255) DEFAULT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `dropoff_location` varchar(255) NOT NULL,
  `pickup_datetime` datetime NOT NULL,
  `estimated_dropoff_datetime` datetime DEFAULT NULL,
  `booking_status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `ride_type` enum('AIRPORT_PICKUP','AIRPORT_DROPOFF','ROUND_TRIP') NOT NULL,
  `total_distance` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_status` enum('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING',
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`booking_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `pickup_airport_id` (`pickup_airport_id`),
  KEY `dropoff_airport_id` (`dropoff_airport_id`),
  KEY `ride__bookings_customer_id` (`customer_id`),
  KEY `ride__bookings_driver_id` (`driver_id`),
  CONSTRAINT `ride_bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ride_bookings_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ride_bookings_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON UPDATE CASCADE,
  CONSTRAINT `ride_bookings_ibfk_4` FOREIGN KEY (`pickup_airport_id`) REFERENCES `airports` (`airport_id`) ON UPDATE CASCADE,
  CONSTRAINT `ride_bookings_ibfk_5` FOREIGN KEY (`dropoff_airport_id`) REFERENCES `airports` (`airport_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ride_bookings`
--

LOCK TABLES `ride_bookings` WRITE;
/*!40000 ALTER TABLE `ride_bookings` DISABLE KEYS */;
INSERT INTO `ride_bookings` VALUES ('00df592a-fd74-42de-9f93-db4ffffe9935','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:17:37','2024-12-17 15:17:37','2024-12-17 15:17:37'),('013044a9-03d3-491a-a0cb-287e2260ec0c','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:46:56','2024-12-13 23:46:56','2024-12-13 23:46:56'),('043841c0-09ba-4215-b8f4-af617230752b','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:31:21','2024-12-13 23:31:21','2024-12-13 23:31:21'),('160221db-6028-4e2b-b9fc-f54a5dc4820b','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:16:07','2024-12-14 00:16:07','2024-12-14 00:16:07'),('1608eb55-882e-434c-a107-3722e3a530f0','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:16:54','2024-12-14 00:16:54','2024-12-14 00:16:54'),('16c6bc11-5286-4e73-a7e5-60a981ab9088','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'f1b3179b-d1f2-4536-8f91-195c1a36bc5f','f40179b-f150-4536-8f91-195c1a36be69','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:14:28','2024-12-13 23:14:28','2024-12-13 23:14:28'),('1e5a0a57-31e3-4f0e-9eaf-aa5aca43b1f9','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:31:04','2024-12-13 23:31:04','2024-12-13 23:31:04'),('226c4564-03ae-4546-9540-3bcd05946260','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:07:41','2024-12-17 15:07:41','2024-12-17 15:07:41'),('24cde891-ad81-4dc9-9e1a-e5df3de5ef2e','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:07:32','2024-12-17 15:07:32','2024-12-17 15:07:32'),('2ac06266-58c7-4906-9870-0443ed6cff47','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:45:24','2024-12-13 23:45:24','2024-12-13 23:45:24'),('346fef04-0620-41a3-a3ce-875a21b919e5','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:18:00','2024-12-14 00:18:00','2024-12-14 00:18:00'),('3c39a1a7-977d-4473-85bb-d8f2dbbfdf6c','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:00:36','2024-12-14 00:00:36','2024-12-14 00:00:36'),('3cdce44b-50c0-44be-9009-08103608fbb1','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:48:18','2024-12-13 23:48:18','2024-12-13 23:48:18'),('4471b80c-505e-4bc4-afde-dca18442c106','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:30:07','2024-12-13 23:30:07','2024-12-13 23:30:07'),('48432bde-1eb2-46b7-beae-14faf308310a','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:19:47','2024-12-14 00:19:47','2024-12-14 00:19:47'),('487ed5c2-274e-4961-9421-d8133f86b6b5','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:48:51','2024-12-13 23:48:51','2024-12-13 23:48:51'),('4a3179b6-f7d9-4aae-9bf1-b3c99a34d210','4a3179b6-f7d9-4aae-9bf1-b3c99a34d290',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','6c3179b6-f7d9-4aae-9bf1-b3c99a34d213','Aéroport Lyon','Place Bellecour','2024-12-13 23:08:36','2024-12-14 00:08:36','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING',NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('4a3179b6-f7d9-4aae-9bf1-b3c99a34d211','4a3179b6-f7d9-4aae-9bf1-b3c99a34d290',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','6c3179b6-f7d9-4aae-9bf1-b3c99a34d213','Aéroport Lyon','Place Bellecour','2024-12-13 23:08:39','2024-12-14 00:08:39','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING',NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('4a3179b6-f7d9-4aae-9bf1-b3c99a34d287','4a3179b6-f7d9-4aae-9bf1-b3c99a34d290',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','6c3179b6-f7d9-4aae-9bf1-b3c99a34d213','Aéroport Lyon','Place Bellecour','2024-12-13 23:08:13','2024-12-14 00:08:13','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING',NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('4a3179b6-f7d9-4aae-9bf1-b3c99a34d288','4a3179b6-f7d9-4aae-9bf1-b3c99a34d290',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','6c3179b6-f7d9-4aae-9bf1-b3c99a34d213','Aéroport Lyon','Place Bellecour','2024-12-13 23:08:29','2024-12-14 00:08:29','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING',NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('4a3179b6-f7d9-4aae-9bf1-b3c99a34d289','4a3179b6-f7d9-4aae-9bf1-b3c99a34d290',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','6c3179b6-f7d9-4aae-9bf1-b3c99a34d213','Aéroport Lyon','Place Bellecour','2024-12-13 23:08:33','2024-12-14 00:08:33','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING',NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('5954440d-33d2-44ac-bc2a-ed1c406af385','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:44:25','2024-12-13 23:44:25','2024-12-13 23:44:25'),('780ddd57-ecb8-417e-939e-c474ff00d45c','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:07:41','2024-12-17 15:07:41','2024-12-17 15:07:41'),('833d0381-4e10-4e34-aaa7-c13ce0b1fa78','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:10:27','2024-12-14 00:10:27','2024-12-14 00:10:27'),('83f84962-5afd-4109-8a33-46cd5c7c03b4','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'f1b3179b-d1f2-4536-8f91-195c1a36bc5f','f40179b-f150-4536-8f91-195c1a36be69','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:14:34','2024-12-13 23:14:34','2024-12-13 23:14:34'),('84e980c0-cd1a-4f6d-8102-23c7212bde66','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:47:24','2024-12-13 23:47:24','2024-12-13 23:47:24'),('9a6ddeb0-a5d3-4c82-9bb7-8acdca7b4437','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:45:54','2024-12-13 23:45:54','2024-12-13 23:45:54'),('a554c4cd-522f-40b1-9230-1a0d9e662f7e','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:12:38','2024-12-14 00:12:38','2024-12-14 00:12:38'),('a5b4380c-6c06-4742-88c1-a68f031de955','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:19:43','2024-12-14 00:19:43','2024-12-14 00:19:43'),('a7de747c-55c7-446f-8b5b-8d09016e5bad','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:05:05','2024-12-14 00:05:05','2024-12-14 00:05:05'),('b26f14ed-03b3-4ef7-94da-deca0fd59e24','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:07:40','2024-12-17 15:07:40','2024-12-17 15:07:40'),('b489e9e8-3b58-4554-8d2b-fd9a12a462a0','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:08:21','2024-12-14 00:08:21','2024-12-14 00:08:21'),('b4d666dd-bf76-4760-8bd2-f472263c79a4','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:52:40','2024-12-13 23:52:40','2024-12-13 23:52:40'),('b59efee0-2c0c-4a47-9239-38be595f5737','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:01:33','2024-12-14 00:01:33','2024-12-14 00:01:33'),('b6052126-dc55-4e94-b252-4a1d0a8383f7','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:14:54','2024-12-14 00:14:54','2024-12-14 00:14:54'),('b905baab-eb7e-46b2-8e33-c1cb75d30c17','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'f1b3179b-d1f2-4536-8f91-195c1a36bc5f','f40179b-f150-4536-8f91-195c1a36be69','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:28:08','2024-12-13 23:28:08','2024-12-13 23:28:08'),('bb0bd6ee-0ea9-437d-aee7-c30957da2fe7','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:48:15','2024-12-13 23:48:15','2024-12-13 23:48:15'),('be6c4b6e-e45c-4d9a-8bca-0e54930102af','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:17:37','2024-12-17 15:17:37','2024-12-17 15:17:37'),('ca1de16e-6450-46fd-9bbd-0963bf094d41','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:17:58','2024-12-14 00:17:58','2024-12-14 00:17:58'),('cb046cb1-c1dd-4a07-b817-1ede89dada37','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:47:31','2024-12-13 23:47:31','2024-12-13 23:47:31'),('cb61778e-9515-4553-8c23-fd1bf3719aef','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:48:37','2024-12-13 23:48:37','2024-12-13 23:48:37'),('d0905f8c-1d85-4570-95a1-e6e2c8cf2b89','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:18:32','2024-12-14 00:18:32','2024-12-14 00:18:32'),('d21f9062-fe68-4c35-91b2-9aee7fcbc8b1','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:17:44','2024-12-17 15:17:44','2024-12-17 15:17:44'),('df49ed24-e82c-435c-8e99-3e2440b8bf27','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:40:01','2024-12-13 23:40:01','2024-12-13 23:40:01'),('e599b455-8f7c-41f5-87e1-d4e44ec14248','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:17:56','2024-12-14 00:17:56','2024-12-14 00:17:56'),('eafe0ad4-224e-4b1d-9353-6973f9e12446','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-17 15:17:42','2024-12-17 15:17:42','2024-12-17 15:17:42'),('efcc9c1d-fe19-4a03-be82-3880bf08eaf4','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:54:33','2024-12-13 23:54:33','2024-12-13 23:54:33'),('f29d6805-eae7-4058-8340-46c89c992393','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'f1b3179b-d1f2-4536-8f91-195c1a36bc5f','f40179b-f150-4536-8f91-195c1a36be69','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:14:35','2024-12-13 23:14:35','2024-12-13 23:14:35'),('f459556d-1ef9-46de-b8fa-474804e56a82','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:20:06','2024-12-14 00:20:06','2024-12-14 00:20:06'),('fa95bda8-05f2-404c-8be3-c51f347a8f12','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:19:46','2024-12-14 00:19:46','2024-12-14 00:19:46'),('fcce8881-ae76-48c6-ba4f-b948be10fbbd','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'4a3179b6-f7d9-4aae-9bf1-b3c99a34d21','d36179b6-f7d9-4aae-9bf1-b3c99a34d220','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-13 23:53:21','2024-12-13 23:53:21','2024-12-13 23:53:21'),('fd4e5d92-b884-41c5-ab10-1320ddc8a9f9','6c3179b6-f7d9-4aae-9bf1-b3c99a34d292',NULL,NULL,'8e3179b6-f7d9-4aae-9bf1-b3c99a34d215','b14179b6-f7d9-4aae-9bf1-b3c99a34d218','Aéroport Lyon','Place Bellecour','2020-12-25 10:33:16','2020-12-25 11:33:16','PENDING','AIRPORT_PICKUP',15.20,30.50,'PENDING','2024-12-14 00:11:08','2024-12-14 00:11:08','2024-12-14 00:11:08');
/*!40000 ALTER TABLE `ride_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_type` enum('CUSTOMER','DRIVER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `profile_image_url` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  UNIQUE KEY `users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('4a3179b6-f7d9-4aae-9bf1-b3c99a34d290','John','Doe','john.doe@example.com','+33612345678','$2b$10$Krh7atxxAnRcdnoRlcj5Ae2ugxOLdESJl/3EyEcZ7p9UU2EwzZrzi','CUSTOMER',NULL,1,1,NULL,NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('5b3179b6-f7d9-4aae-9bf1-b3c99a34d291','Jane','Smith','jane.smith@example.com','+33698765432','$2b$10$Krh7atxxAnRcdnoRlcj5Ae2ugxOLdESJl/3EyEcZ7p9UU2EwzZrzi','CUSTOMER',NULL,1,1,NULL,NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('6c3179b6-f7d9-4aae-9bf1-b3c99a34d292','Michael','Brown','michael.brown@example.com','+33611223344','$2b$10$Krh7atxxAnRcdnoRlcj5Ae2ugxOLdESJl/3EyEcZ7p9UU2EwzZrzi','CUSTOMER',NULL,1,1,NULL,NULL,'2020-12-25 11:33:16','2020-12-25 11:33:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `vehicle_id` varchar(255) NOT NULL,
  `driver_id` varchar(255) DEFAULT NULL,
  `make` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `vehicle_type` varchar(20) DEFAULT NULL,
  `passenger_capacity` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES ('4a3179b6-f7d9-4aae-9bf1-b3c99a34d288',NULL,'Ford','Focus',2020,'XY-456-ZD','HATCHBACK',5,1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('5b3179b6-f7d9-4aae-9bf1-b3c99a34d289',NULL,'Toyota','Corolla',2022,'LM-789-ZZ','SEDAN',4,1,'2020-12-25 11:33:16','2020-12-25 11:33:16'),('6c3179b6-f7d9-4aae-9bf1-b3c99a34d290',NULL,'Honda','Civic',2019,'QW-123-AB','SEDAN',4,1,'2020-12-25 11:33:16','2020-12-25 11:33:16');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-14 14:09:02
