import { LightningElement, track } from 'lwc';
import sendProductRequest from '@salesforce/apex/ProductRequestController.sendProductRequest';
import createAttachment from '@salesforce/apex/ProductRequestController.createAttachment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class RequestProductButton extends LightningElement {

    @track preferredQuantity = 1;
    @track selectedCertificates = []; 

    @track showMachineInfo = false; 
    buttonIcon = 'utility:add'; 
    buttonText = 'Expand'; 

    @track isAgreedToDataPolicy = false; 
    @track isNotABot = false; 

    @track showProductInfo = true;
    @track showPersonalDataForm = false
    @track showFurtherInfo = false; 

    @track formData = {
        materialNumber : '',
        articleName : '',
        application : '',
        machineType : '',
        serialNumber : '',
        shaftDiameter : '',
        rotationSpeed : '',
        machineTag : '',
        pressure : '',
        temperature : '',
        medium : '',
        abrasiveParticles : '',
        productCategory : '',
        sealingSupplySystemInput:'',
        planInput : '',
        operatingLocationInput:'',
        additionalInfoInput:'',
        //
        applicationPackaging:'',
        dimensionsSealChamberInput:'',
        movementRPMInput:'',
        geometryInput:'',
        //
        gasketgeometryInput:'',
        screwsInput:'',
        //
        othersInput:'',
        //
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        customerNumber: '',
        msgInput: ''
    };

    attachment = null;

    get titleOptions() {
        return [
            { label: 'Mr.', value: 'Mr.' },
            { label: 'Mrs.', value: 'Mrs.' },
            { label: 'Miss', value: 'Miss.' },
            { label: 'Dr.', value: 'Dr.' }
        ];
    }

    get radioOptions() {
        return [
            { label: 'Yes', value: 'Yes'},
            { label: 'No', value: 'No'}
        ];
    }

    get productCategoryOptions() {
        return [
            { label: 'Mechanical Seals', value: 'Mechanical Seals' },
            { label: 'Packings', value: 'Packings' },
            { label: 'Gaskets', value: 'Gaskets' },
            { label: 'Others', value: 'Others' }
        ];
    }

    get operatingLocationOptions() {
        return [
            { label: 'Inside', value: 'Inside' },
            { label: 'Outside', value: 'Outside' },
            { label: 'Covered (Under roof, etc.)', value: 'Covered' }
        ];
    }

    get certificateOptions() {
        return [
            { label: 'ATEX Declaration', value: 'ATEX Declaration' },
            { label: '2.1 Declaration', value: '2.1 Declaration' },
            { label: '2.2 Material Certificate', value: '2.2 Material Certificate' },
            { label: '3.1 Inspection Test Certificate of Raw Material', value: '3.1 Inspection Test Certificate of Raw Material' }
        ];
    }
    
    increaseQuantity() {
        this.preferredQuantity += 1; 
        console.log ('preferredQuantity : ' +this.preferredQuantity);
    }

    decreaseQuantity() {
        if (this.preferredQuantity > 1) {
            this.preferredQuantity -= 1; 
        }
        console.log ('preferredQuantity : ' +this.preferredQuantity);
    }

    toggleInputs() {
        this.showMachineInfo = !this.showMachineInfo;
        this.buttonIcon = this.showMachineInfo ? 'utility:dash' : 'utility:add';
        this.buttonText = this.showMachineInfo ? 'Collapse' : 'Expand';
    }

    get isMechanicalSeals() {
        return this.formData.productCategory === 'Mechanical Seals';
    }

    get isPackings() {
        return this.formData.productCategory === 'Packings';
    }

    get isGaskets() {
        return this.formData.productCategory === 'Gaskets';
    }

    get isOthers() {
        return this.formData.productCategory === 'Others';
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.detail.value;
        if (field === 'preferredQuantity') {
            this.preferredQuantity = value;
        } else if (field === 'selectedCertificates') {
            this.selectedCertificates = Array.isArray(value) ? value : [value];
        } else {
            this.formData = { ...this.formData, [field]: value };
        }
        console.log(`Field: ${field}, Value: ${value}`);
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                this.showToast('Error', 'Invalid file type. Please upload a PDF, JPEG, or PNG file.', 'error');
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                this.showToast('Error', 'File size exceeds the 4 MB limit.', 'error');
                return;
            }
            this.attachment = file;
            console.log('Selected file:', file.name);
        } else {
            this.attachment = null;
        }
    }
    
    
    handleNextForProductData() {
        this.showProductInfo = false;
        this.showPersonalDataForm = true;
    
    }

    handleNextForPersonalData()
    {
        this.showFurtherInfo = true;
        this.showPersonalDataForm = false;
    }

    handleBack() {
        this.showProductInfo = true;
        this.showPersonalDataForm = false;
    }
    handleBackForPersonalData() {
        this.showPersonalDataForm = true;
        this.showFurtherInfo = false;
    }

    parseInteger(value) {
        return isNaN(parseInt(value, 10)) ? null : parseInt(value, 10);
    }

    async handleSendRequest(event) {
        console.log('Form data before sending:', JSON.stringify(this.formData));
        const requestData = {
            ...this.formData,
            shaftDiameter: this.parseInteger(this.formData.shaftDiameter),
            rotationSpeed: this.parseInteger(this.formData.rotationSpeed),
            pressure: this.parseInteger(this.formData.pressure),
            temperature: this.parseInteger(this.formData.temperature),
            movementRPMInput: this.parseInteger(this.formData.movementRPMInput),
            preferredQuantity: this.preferredQuantity,
            selectedCertificates: this.selectedCertificates,
        };
    
        try {
            const result = await sendProductRequest({ requestWrapper: JSON.stringify(requestData) });
            console.log('Request result:', JSON.stringify(result));
            if (result) {
                if (this.attachment) {
                    await this.uploadAttachment(result);
                }
                this.showToast('Success', 'Product request sent successfully!', 'success');
            } else {
                this.showToast('Error', 'Failed to send product request.', 'error');
            }
        } catch (error) {
            // Check if the error object and error.body.message are defined
            const errorMessage = error && error.body && error.body.message ? error.body.message : 'An unknown error occurred.';
            console.error('Error sending product request:', error);
            this.showToast('Error', errorMessage, 'error');
        }
    }
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
    
    async uploadAttachment(recordId) {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1];
            try {
                // Call your Apex method to create the attachment
                await createAttachment({
                    parentId: recordId,  // Ensure this is the correct record ID
                    fileName: this.attachment.name,
                    base64Data: base64
                });
                console.log('File uploaded successfully');
                this.showToast('Success', 'File uploaded successfully!', 'success');
            } catch (error) {
                console.error('Error uploading file:', error);
                this.showToast('Error', 'Failed to upload file.', 'error');
            }
        };
        reader.readAsDataURL(this.attachment);
    }
    
    
}