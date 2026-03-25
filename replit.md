# Grudge Studio Arena 3D + SDK

## Overview
This project delivers a browser-based 3D Multiplayer Online (MMO) arena fighting game and the **GRUDGE STUDIO SDK**, a robust game development framework. It aims to provide a comprehensive, full-stack solution for developers to create immersive 3D online games, leveraging advanced physics, AI, and networking capabilities. The project includes a 3D Combat System, a Tab-Targeting System, an AI Opponent with difficulty scaling, and a comprehensive Character Stats System. The business vision is to provide a comprehensive toolset for creating immersive 3D online games, with market potential in the indie game development and educational sectors.

## User Preferences
- Player default: Viking Warrior (not gladiator)
- Opponent default: Orc Warrior
- Single game flow: Menu -> Character Select -> Arena Combat
- Minimal UI canvas - one scene at a time

## System Architecture

### UI/UX Decisions
The project features a dynamic canvas-based UI for in-game elements, a multi-camera system (Third Person, First Person, Action, RTS, Top Down, Isometric), and a Character Select Scene with 3D model rotation. The World Builder provides a visual editor with a professional UI, including a Scene Hierarchy, Inspector Panel, Menu Bar, Visual Node Graph Editor, and a Timeline Panel for keyframe animation.

### Technical Implementations
The project uses **Three.js** for 3D rendering and **Rapier 3D** for physics. **Vite** is used for development, and custom GLSL shaders handle procedural terrain. Real-time networking is managed by **Socket.IO** within the SDK. A Needle Engine-inspired component system, a Lua scripting engine (Fengari-based), a Universal Animation System with Rig Profiles, and a Modular Character Generation System are core technical implementations. Vehicle Physics, based on Rapier 3D, is implemented with a Q-learning AI for autonomous driving.

### Feature Specifications

#### GRUDGE Engine
Provides core functionalities such as a Platform Controller, AI-powered Crafting System, and procedural Weapon Generation.

#### GRUDGE STUDIO SDK
A modular framework encompassing core utilities, rendering (scene management, cameras, animation, materials, assets, particles), controllers (character, vehicle, combat), terrain generation, networking (state synchronization, client-side prediction, lobby management), UI components, asset management, and AI integration.

#### Puter Integration
Integrates Puter.js SDK for AI and cloud features, including chat, text-to-speech, image generation, and cloud KV storage for game saves, dynamic combat narration, and character AI generation.

#### Character Storage Service
Cloud-first persistence layer for character data using Puter KV storage with localStorage fallback:
- **CharacterStorageService** (`src/storage/CharacterStorageService.js`): Manages cloud sync for character stats, skill trees, and profiles
- **Key Format**: `character:{userId}:{characterId}:{type}` where type is stats/skills/profile
- **Auto-sync**: SkillTreeStats automatically syncs to cloud when user is authenticated
- **Conflict Resolution**: Cloud data with newer timestamps takes precedence
- **Export/Import**: Full character data can be exported to JSON and imported elsewhere

#### Grudge Studio Network
A complete network infrastructure built on Puter.js APIs, featuring user authentication, real-time chat, online status tracking, leaderboards, friend systems, and a network admin dashboard.

#### Arena Game
Features a 3D Combat System, Tab-Targeting System, AI Opponent with difficulty scaling, Round System, 3D Playground, comprehensive Character Stats System (D&D-style), editable Terrain Editing System, A* pathfinding, editable keybinds, dual action bars, and an Environment System with day/night cycles and weather.

#### Stat System with Diminishing Returns
Character attributes include a diminishing returns system with varying effectiveness tiers (1-25: full; 26-35: diminishing; 36+: hard cap). A weighted power score system evaluates characters, categorizing them into rankings (e.g., Fodder, Legend, Divine).

#### Character Builder
Integrates the diminishing returns system, displaying raw and effective stat values, color-coded warnings for diminishing returns, and an info box explaining thresholds.

#### Skill Tree Backgrounds
Skill trees display thematic background images, dynamically changing based on the selected tree (class, weapon, custom).

#### Water System & Effects
A comprehensive water rendering system includes FFT-based ocean water, flow-map based pool water, custom GLSL shader water with animated waves and realistic lighting, and splat particle effects.

#### World Builder / Terrain Editor
Features a bright editor-friendly lighting setup, brush-based terrain sculpting with various tools (Raise, Lower, Smooth, Flatten, Noise, Painting, Water Level), five paint layers, adjustable brush settings, undo/redo, procedural generation, quick action buttons, a radial menu for object placement, visual feedback, onboarding tips, enhanced play mode, keyboard shortcuts, context menus, and asset import/export functionalities (GLB, GLTF, FBX, OBJ, JSON). Supports scene storage via localStorage.

## External Dependencies
-   **Three.js**: 3D WebGL rendering engine.
-   **Rapier 3D**: Physics engine.
-   **Vite**: Build tool.
-   **Socket.IO**: Real-time bidirectional event-based communication.
-   **Puter.js**: Cloud platform SDK for AI, storage, and hosting.