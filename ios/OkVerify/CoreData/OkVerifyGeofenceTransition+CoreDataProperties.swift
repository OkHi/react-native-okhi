//
//  OkVerifyGeofenceTransition+CoreDataProperties.swift
//  Okhi
//
//  Created by Julius Kiano on 25/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//
//

import Foundation
import CoreData


extension OkVerifyGeofenceTransition {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<OkVerifyGeofenceTransition> {
        return NSFetchRequest<OkVerifyGeofenceTransition>(entityName: "OkVerifyGeofenceTransition")
    }

    @NSManaged public var accuracy: Double
    @NSManaged public var geoPointSource: String?
    @NSManaged public var latitude: Double
    @NSManaged public var locationDate: Int32
    @NSManaged public var locationId: String?
    @NSManaged public var longitude: Double
    @NSManaged public var transition: String?
    @NSManaged public var transitionDate: Int32
    @NSManaged public var id: String?

}
