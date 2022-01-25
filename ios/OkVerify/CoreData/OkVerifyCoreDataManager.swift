//
//  OkVerifyCoreDataManager.swift
//  Okhi
//
//  Created by Julius Kiano on 21/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import UIKit
import CoreData

class OkVerifyCoreDataManager {
    let dataModel: String = "OkVerifyModel"
    
    private lazy var persistentContainer: NSPersistentContainer = {
        let modelURL = Bundle(for: OkVerify.self).url(forResource: dataModel, withExtension: "momd")
        var container: NSPersistentContainer
        guard let model = modelURL.flatMap(NSManagedObjectModel.init) else {
            fatalError("Fail to load the data model")
        }
        container = NSPersistentContainer(name: dataModel, managedObjectModel: model)
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        })
        return container
    }()
    
    private func saveContext() {
        let context = persistentContainer.viewContext
        if context.hasChanges {
            do {
                try context.save()
                print("Data recorded successfully!")
            } catch {
                print("Data recorded FAIL!")
                let nserror = error as NSError
                debugPrint(nserror)
                // TODO: handle error
            }
        }
    }
    
    public func saveUser(user: User) -> OkVerifyUser? {
        if let phone = user.phoneNumber, let existingUser = fetchUser(phoneNumber: phone) {
            return existingUser
        }
        if let newUser = NSEntityDescription.insertNewObject(forEntityName: "OkVerifyUser", into: persistentContainer.viewContext) as? OkVerifyUser {
            newUser.phoneNumber = user.phoneNumber
            newUser.bearerToken = user.bearerToken
            newUser.accessToken = user.accessToken
            newUser.environment = user.environment
            newUser.id = user.id
            saveContext()
            return newUser;
        }
        return nil
    }
    
    public func fetchUser(phoneNumber: String) -> OkVerifyUser? {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyUser")
        fetchRequest.fetchLimit = 1
        fetchRequest.predicate = NSPredicate(format: "phoneNumber == %@", phoneNumber)
        do {
            let data = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyUser]
            return data?.first
        } catch {
            return nil
        }
    }
    
    public func fetchAllUsers() -> [OkVerifyUser] {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyUser")
        do {
            let data = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyUser]
            if let results = data {
                if !results.isEmpty {
                    return results
                }
            }
            return []
        } catch {
            return []
        }
    }
    
    public func fetchUser(locationId: String) -> OkVerifyUser? {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyGeofence")
        fetchRequest.fetchLimit = 1
        fetchRequest.predicate = NSPredicate(format: "id == %@", locationId)
        do {
            let results = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyGeofence]
            if let userId = results?.first?.userId {
                return fetchUser(userId: userId)
            }
            return nil
        } catch {
            return nil
        }
    }
    
    public func fetchUser(userId: String) -> OkVerifyUser? {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyUser")
        fetchRequest.fetchLimit = 1
        fetchRequest.predicate = NSPredicate(format: "id == %@", userId)
        do {
            let data = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyUser]
            if let results = data {
                if !results.isEmpty {
                    return results.first
                }
            }
            return nil
        } catch {
            return nil
        }
    }
    
    public func saveGeofenceTransition(
        locationId: String?,
        transitionDate: Int?,
        locationDate: Int?,
        latitude: Double?,
        longitude: Double?,
        accuracy: Double?,
        transition: String?,
        geoPointSource: String?,
        transitionId: String?
    ) {
        if let transit = NSEntityDescription.insertNewObject(forEntityName: "OkVerifyGeofenceTransition", into: persistentContainer.viewContext) as? OkVerifyGeofenceTransition {
            transit.locationId = locationId
            transit.transitionDate = Int32(transitionDate ?? -1)
            transit.locationDate = Int32(locationDate ?? -1)
            transit.latitude = latitude ?? -1.0
            transit.longitude = longitude ?? -1.0
            transit.accuracy = accuracy ?? -1.0
            transit.transition = transition
            transit.geoPointSource = geoPointSource
            transit.id = transitionId
            saveContext()
        }
    }
    
    public func fetchAllGeofenceTransitions() -> [OkVerifyGeofenceTransition] {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyGeofenceTransition")
        do {
            let data = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyGeofenceTransition]
            if let results = data {
                if !results.isEmpty {
                    return results
                }
            }
            return []
        } catch {
            return []
        }
    }
    
    public func saveGeofence(geofence: Geofence) {
        if let newGeofence = NSEntityDescription.insertNewObject(forEntityName: "OkVerifyGeofence", into: persistentContainer.viewContext) as? OkVerifyGeofence {
            if let lat = geofence.latitude,
               let lon = geofence.longitude,
               let radius = geofence.radius
            {
                newGeofence.id = geofence.id
                newGeofence.latitude = lat
                newGeofence.longitude = lon
                newGeofence.radius = radius
                newGeofence.userId = geofence.userId
                saveContext()
            }
            
        }
    }
    
    public func fetchGeofence(locationId: String) -> OkVerifyGeofence? {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyGeofence")
        fetchRequest.fetchLimit = 1
        fetchRequest.predicate = NSPredicate(format: "id == %@", locationId)
        do {
            let data = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyGeofence]
            if let results = data {
                if !results.isEmpty {
                    return results.first
                }
            }
            return nil
        } catch {
            return nil
        }
    }
    
    public func deleteGeofence(locationId: String) {
        if let geofence = fetchGeofence(locationId: locationId) {
            persistentContainer.viewContext.delete(geofence)
            saveContext()
        }
    }
    
    public func fetchAllGeofences() -> [OkVerifyGeofence] {
        let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: "OkVerifyGeofence")
        do {
            let data = try persistentContainer.viewContext.fetch(fetchRequest) as? [OkVerifyGeofence]
            if let results = data {
                if !results.isEmpty {
                    return results
                }
            }
            return []
        } catch {
            return []
        }
    }
    
    public func fetchEmptyUser() -> OkVerifyUser {
        return OkVerifyUser(context: persistentContainer.viewContext)
    }
    
    public func fetchEmptyGeofence() -> OkVerifyGeofence {
        return OkVerifyGeofence(context: persistentContainer.viewContext)
    }
}
