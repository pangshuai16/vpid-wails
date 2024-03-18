package usb

import (
	"context"
	"fmt"
	"sort"

	"github.com/google/gousb"
)

type USB struct {
	ctx context.Context
}

type Device struct {
	VendorID     string `json:"vid"`      // Device Vendor ID
	ProductID    string `json:"pid"`      // Device Product ID
	Product      string `json:"name"`     // Product string
	Manufacturer string `json:"vendor"`   // Manufacturer String
	Version      string `json:"version"`  // Device Release Number in binary-coded decimal, also known as Device Version Number
	Class        string `json:"class"`    // The class of this device
	SubClass     string `json:"subclass"` // The sub-class (within the class) of this device
	Protocol     string `json:"protocol"` // The protocol (within the sub-class) of this device
}
type UsbList struct {
	CurrentList []Device `json:"currentList"`
	AddList     []Device `json:"addList"`
	RemoveList  []Device `json:"removeList"`
}

var currentList = []Device{}
var baseList = []Device{}

func (a *USB) GetHidList() UsbList {

	ctx := gousb.NewContext()
	defer ctx.Close()
	// 初始化 USB 上下文
	ctx.Debug(0)
	currentList = currentList[:0]
	// 打开 USB 设备
	_, err := ctx.OpenDevices(func(desc *gousb.DeviceDesc) bool {
		// 返回 true，以匹配所有设备

		device, err := ctx.OpenDeviceWithVIDPID(desc.Vendor, desc.Product)
		if err != nil {
			currentList = append(currentList, Device{
				VendorID:     desc.Vendor.String(),
				ProductID:    desc.Product.String(),
				Version:      desc.Device.String(),
				Manufacturer: "",
				Product:      "",
				Class:        desc.Class.String(),
				SubClass:     desc.SubClass.String(),
			})
			return false
		}
		defer device.Close()
		manufacturer, _ := device.Manufacturer()
		product, _ := device.Product()
		currentList = append(currentList, Device{
			VendorID:     desc.Vendor.String(),
			ProductID:    desc.Product.String(),
			Version:      desc.Device.String(),
			Manufacturer: manufacturer,
			Product:      product,
			Class:        desc.Class.String(),
			SubClass:     desc.SubClass.String(),
		})
		return false
	})
	if err != nil {
		fmt.Println("No USB devices found")
	}

	sort.Slice(currentList, func(i, j int) bool {
		if currentList[i].VendorID == currentList[j].VendorID {
			return currentList[i].ProductID < currentList[j].ProductID
		}
		return currentList[i].VendorID < currentList[j].VendorID
	})

	if len(baseList) == 0 {
		a.SetHidBase()
	}

	addList, removeList := CompareSlices(baseList, currentList)

	return UsbList{
		CurrentList: currentList,
		AddList:     addList,
		RemoveList:  removeList,
	}
}

func (a *USB) SetHidBase() {
	baseList = make([]Device, len(currentList))
	copy(baseList, currentList)
}

func CompareSlices(baseList []Device, currentList []Device) (added []Device, removed []Device) {
	set1 := make(map[string]bool)
	set2 := make(map[string]bool)

	// 将切片1的元素添加到set1
	for _, dev := range baseList {
		key := fmt.Sprintf("%s-%s", dev.ProductID, dev.VendorID)
		set1[key] = true
	}

	// 将切片2的元素添加到set2，并检查新增的元素
	for _, dev := range currentList {
		key := fmt.Sprintf("%s-%s", dev.ProductID, dev.VendorID)
		set2[key] = true
		if !set1[key] {
			added = append(added, dev)
		}
	}

	// 检查从切片1中减少的元素
	for _, dev := range baseList {
		key := fmt.Sprintf("%s-%s", dev.ProductID, dev.VendorID)
		if !set2[key] {
			removed = append(removed, dev)
		}
	}

	return added, removed
}
