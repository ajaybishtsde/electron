declare namespace NodeJS {
    interface Process {
        guestInstanceId?: number;
        resourcePath?: string;      
        app?: any;
        store?: any;    
    }
}

interface NodeModule {
    hot?: any;
}
