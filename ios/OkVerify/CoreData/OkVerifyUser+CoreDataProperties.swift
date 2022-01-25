//
//  OkVerifyUser+CoreDataProperties.swift
//  Okhi
//
//  Created by Julius Kiano on 24/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//
//

import Foundation
import CoreData


extension OkVerifyUser {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<OkVerifyUser> {
        return NSFetchRequest<OkVerifyUser>(entityName: "OkVerifyUser")
    }

    @NSManaged public var accessToken: String?
    @NSManaged public var bearerToken: String?
    @NSManaged public var environment: String?
    @NSManaged public var phoneNumber: String?
    @NSManaged public var id: String?

}
