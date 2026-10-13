package com.campusplacement.service;

import com.campusplacement.dto.StoredFile;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    StoredFile storePdf(MultipartFile file);
    Resource loadAsResource(String storageFileName);
    void deleteFile(String storageFileName);
}
