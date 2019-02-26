export class Person{
    public Id:number; 
    public Name:string; 
    public Address:string;
    public MailAddress:string; 
    public Telephone:string;
    public Zipcode:string;
    public City:string; 
    public Manager:Person;  // Manager user ID 
    public ManagerLoginName:string; 
    public Department:string; 
    public CountyCode:string;  
    public ProfileImageUrl:string;   
    public Branch:string; // Virksomhet 

    constructor()
    {
        this.Id = -1;     
        this.Name = "";    
        this.Address = ""; 
        this.MailAddress = ""; 
        this.Telephone = ""; 
        this.Zipcode = ""; 
        this.City = "";
         this.Manager = null; 
         this.ManagerLoginName = ""; 
         this.Department = ""; 
         this.CountyCode  = ""; 
         this.ProfileImageUrl = ""; 
         this.Branch = ""; 
    }
}