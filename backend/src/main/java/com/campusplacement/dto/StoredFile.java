package com.campusplacement.dto;

public class StoredFile {
    private String originalFileName;
    private String storageFileName;
    private String contentType;
    private long fileSize;

    public StoredFile() {}

    public StoredFile(String originalFileName, String storageFileName, String contentType, long fileSize) {
        this.originalFileName = originalFileName;
        this.storageFileName = storageFileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStorageFileName() { return storageFileName; }
    public void setStorageFileName(String storageFileName) { this.storageFileName = storageFileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
}
