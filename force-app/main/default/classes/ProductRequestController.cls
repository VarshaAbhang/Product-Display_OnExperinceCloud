public with sharing class ProductRequestController {

    @AuraEnabled
    public static void sendProductRequest(
        String materialNumber,
        String articleName,
        Integer preferredQuantity,
        String application,
        String machineType,
        String serialNumber,
        Integer shaftDiameter,
        Integer rotationSpeed,
        String machineTag,
        Integer pressure,
        Integer temperature,
        String medium,
        String abrasiveParticles,
        String productCategory,
        String sealingSupplySystemInput,
        String planInput, 
        String operatingLocationInput,
        String additionalInfoInput,
        List<String> selectedCertificates, // Multiselect Picklist
        string applicationInput,
        String dimensionsSealChamberInput, 
        Integer movementRPMInput, 
        String geometryInput, 
        String screwsInput, 
        string othersInput,
        String title,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String customerNumber,
        String msgInput
       // Id attachmentId // If you're using attachments
    ) {
        try {

            Product_Request__c productRequest = new Product_Request__c();
           
            productRequest.Material_Number__c = materialNumber;
            productRequest.Article_Name__c = articleName;
            productRequest.Preferred_Quantity__c = preferredQuantity;
            productRequest.Application__c = application;
            productRequest.Machine_Type__c = machineType;
            productRequest.Serial_Number__c = serialNumber;
            productRequest.Shaft_Diameter__c = shaftDiameter;
            productRequest.Rotation_Speed__c = rotationSpeed;
            productRequest.Machine_TAG__c = machineTag;
            productRequest.Pressure__c = pressure;
            productRequest.Temperature__c = temperature;
            productRequest.Medium__c = medium;
            productRequest.Abrasive_Particles_in_Medium__c = abrasiveParticles;
            productRequest.Product_Category__c = productCategory;
            productRequest.Sealing_Supply_System__c = SealingsupplysystemInput;
            productRequest.Plan__c = planInput;
            productRequest.Operating_Location__c = operatingLocationInput;
            productRequest.Additional_Info__c = additionalInfoInput;
            productRequest.Certificates__c = String.join(selectedCertificates, ','); 
            productRequest.Application_Input__c = applicationInput;
            productRequest.Dimensions_Seal_Chamber__c = dimensionsSealChamberInput;
            productRequest.Movement_RPM__c = movementRPMInput;
            productRequest.Geometry__c = geometryInput;
            productRequest.Screws__c = screwsInput;
            productRequest.Others_Input__c = othersInput;
            productRequest.Title__c = title;
            productRequest.First_Name__c = firstName;
            productRequest.Last_Name__c = lastName;
            productRequest.Email__c = email;
            productRequest.Phone_Number__c = phoneNumber;
            productRequest.Customer_Number__c = customerNumber;
            productRequest.Message__c = msgInput;
    
            // if (attachmentId != null) {
            //     // Logic to attach the file if required
            // }
            
            insert productRequest;

            // Optionally, you can send an email notification or perform other actions here

        } catch (Exception e) {
            throw new AuraHandledException('Error occurred while sending product request: ' + e.getMessage());
        }
    }
}
