# 2025-03-22 19:09:44 by RouterOS 7.18.2
# software id = 2AYS-E97L
#
# model = E50UG
# serial number = HHE0A5YJJKC

# PSK This lets WinBox work from outside the router
/ip firewall filter add action=accept chain=input dst-port=8291 protocol=tcp

#PSK Create a bridge interface and assign it an IP network / address range and setup DHCP
/interface bridge add name=HotSpot
/ip address add address=192.168.99.1/24 comment=HotSpot interface=HotSpot network=192.168.99.0
/ip pool add name="Hotspot Pool" ranges=192.168.99.10-192.168.99.254
/ip dhcp-server add address-pool="Hotspot Pool" interface=HotSpot name=HotSpotDHCP
/ip dhcp-server network add address=192.168.99.0/24 dns-server=192.168.99.1 gateway=192.168.99.1

# Removed ether3 from default bridge settings
# PSK assign ether3 port to the bridge
/interface bridge port add bridge=HotSpot interface=ether3

#PSK Setup CapsMan
/interface wifi capsman set enabled=yes package-path="" require-peer-certificate=no upgrade-policy=none
/interface wifi configuration add country="United States" disabled=no name=EllaFiCfg qos-classifier=priority ssid=EllaFi
/interface wifi provisioning add action=create-dynamic-enabled disabled=no master-configuration=EllaFiCfg

#PSK Hotspot Config using default profiles
/ip hotspot profile set [ find default=yes ] hotspot-address=192.168.99.1 html-directory=JuanFi
/ip hotspot add address-pool="Hotspot Pool" disabled=no interface=HotSpot name=EllaFi
/ip hotspot user profile set [ find default=yes ] address-pool="Hotspot Pool"
/ip hotspot user add name=test password=test server=EllaFi

#add static ip for ESP32
#PSK I don't the address, address-list and mac are all needed
/ip dhcp-server lease add address=192.168.99.2 address-lists=JuanfiVendo mac-address=8C:CE:4E:C8:2B:CA server=HotSpotDHCP

#PSK Let anything pass coming from the ESP32 (I thought this would already happen with the IP Binding)
#PSK Maybe the ip-binding lets you go to the internet, the firewall rule lets you hit the land?
/ip firewall address-list add address=192.168.99.2 list=JuanfiVendo
/ip firewall filter add action=accept chain=input comment=JuanfiVendo src-address-list=JuanfiVendo
/ip firewall filter add action=passthrough chain=unused-hs-chain comment="place hotspot rules here" disabled=yes
/ip hotspot ip-binding add address=192.168.99.2 mac-address=8C:CE:4E:C8:2B:CA type=bypassed

#PSK Let everyone access the ESP32 even if not logged in (via calls from mikrotik html status/login page)
/ip hotspot walled-garden ip add action=accept disabled=no !dst-address dst-address-list=JuanfiVendo !dst-port !protocol !src-address !src-address-list
/ip hotspot walled-garden add comment="place hotspot rules here" disabled=yes
