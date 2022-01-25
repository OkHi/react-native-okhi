//
//  OkVerifyGeofence+CoreDataProperties.swift
//  Okhi
//
//  Created by Julius Kiano on 24/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//
//

import Foundation
import CoreData


extension OkVerifyGeofence {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<OkVerifyGeofence> {
        return NSFetchRequest<OkVerifyGeofence>(entityName: "OkVerifyGeofence")
    }

    @NSManaged public var latitude: Double
    @NSManaged public var id: String?
    @NSManaged public var longitude: Double
    @NSManaged public var radius: Double
    @NSManaged public var userId: String?

}
